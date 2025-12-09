# imports needed for backend.py
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
import re
from pymongo import MongoClient
from datetime import datetime
from fastapi import HTTPException
from bson.objectid import ObjectId
from fastapi import Query

# MongoDB setup so that the uploaded dashboards can be stored
MONGO_URI = "mongodb+srv://ellaosikoya:smartpocket123@transactionhistory.euvjjnf.mongodb.net/"
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)

try:
    client.admin.command("ping")
    print("MongoDB connected successfully")
except Exception as e:
    print("MongoDB CONNECTION ERROR:", e)

# This creates the database: expense_db and collection: dashboards
db = client["expense_db"]
dashboards = db["dashboards"]

# Initialises FastAPI application
app = FastAPI()

# Allows requests from React frontend 
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Keyword-based rule system for expense categorisation
CATEGORIES = {
    "Groceries": ["tesco", "aldi", "lidl", "dunnes", "spar", "asialand"],
    "Transport": ["burkes bus", "irish rail", "transport for ireland", "tfi"],
    "Food": ["mcdonald", "just eat", "bds vending"],
    "Subscriptions": ["spotify", "apple", "gomo"],
    "Education": ["atlantic technological university"],
    "Transfers": ["transfer to", "transfer from"],
}

# Function that catgeorises a single transaction's description using rules
def categorise_description(text: str):
    text = text.lower()

    # Loop through each category
    for category, keywords in CATEGORIES.items():
        # Check if any keyword appears in the text
        if any(k in text for k in keywords):
            return category
    
    # Default category if nothing matched
    return "Other"

# Regex pattern to extract transactions from bank PDF text for example 12/11 Tesco -45.00
transaction_pattern = re.compile(
    r"(\d{1,2}\s+(?:\w{3}|\w+)\s+\d{4})\s+(.+?)\s+€?(\d+\.\d{2}|0\.00)\s+€?(\d+\.\d{2}|0\.00)"
)


# GROUP 1 → date
# GROUP 2 → description
# GROUP 3 → amount (positive = income, negative = expense)

# Function that extracts transactions using the regex pattern above
def extract_transactions(text: str):
    transactions = []

    for match in transaction_pattern.finditer(text):
        date, desc, money_out, money_in = match.groups()

        money_out = float(money_out)
        money_in = float(money_in)
        desc_lower = desc.lower()
        
        if "pocket" in desc_lower:
            continue    
        
        # Transfers via apple pay are now classed as income
        if "apple pay top-up" in desc_lower or "apple pay top up" in desc_lower:
            # money_out contains the real top-up amount
            amount = money_out # classed as positive income
            transactions.append({
                "date": date,
                "description": desc,
                "amount": amount
            })
            continue

        # Transfers from people should be classed as income
        if "transfer from" in desc_lower:
            amount = abs(money_out) # Revolut will print the actual transfer amount here
            transactions.append({
                "date": date,
                "description": desc,
                "amount": amount # classed as positive
            })
            continue
        
        # Transfers to people should be classed as outcome
        if "transfer to" in desc_lower:
            amount = -abs(money_out) # Revolut will print the actual transfer amount here
            transactions.append({
                "date": date,
                "description": desc,
                "amount": amount # classed as negative
            })
            continue
        
        # Determine actual transaction amount for regular transactions
        if money_out > 0:
            amount = -money_out
        else:
            amount = money_in  # true income (rare but possible)

        transactions.append({
            "date": date,
            "description": desc,
            "amount": amount
        })

    return transactions

# FastAPI endpoint to receive the uploaded PDF file
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Main backend endpoint:
    - Receives a PDF file from the React frontend
    - Extracts all text using pdfplumber
    - Uses regex to detect transactions
    - Splits them into income vs outcome
    - Categorises expenses using rules
    - Returns structured JSON results
    """
    
    # Extracts the PDF text
    try:
        with pdfplumber.open(file.file) as pdf:
            # Joins text from all PDF pages
            text = "\n".join(page.extract_text() or "" for page in pdf.pages)
            print(text)
    except  Exception as e:
        return {"error": f"Could not read PDF: {e}"}
    
    # Extract transactions using regex
    transactions = extract_transactions(text)
    
    # Structure that will be returned to frontend
    results = {
        "income": [],
        "outcome": []
    }
    
    # Classifies income/expense + Categorise
    for tx in transactions:
        amount = tx["amount"]
        
        if amount > 0:
            # Positive amounts = income
            results["income"].append(tx)
            
        else:
            category = categorise_description(tx["description"])
            tx["category"] = category
            results["outcome"].append(tx)
            
    # totals for dashboard storage
    total_income = sum(tx["amount"] for tx in results["income"])
    total_outcome = sum(abs(tx["amount"]) for tx in results["outcome"])
    net_balance = total_income - total_outcome
    
    # categories totals
    categoryTotals = {}
    for tx in results["outcome"]:
        cat = tx["category"]
        categoryTotals[cat] = categoryTotals.get(cat, 0) + abs(tx["amount"])
    
    record = {
    "timestamp": datetime.now().isoformat(),
    "income": results["income"],
    "outcome": results["outcome"],
    "total_income": total_income,
    "total_outcome": total_outcome,
    "net_balance": total_income - total_outcome,
    "categories": categoryTotals
}

    inserted = dashboards.insert_one(record)

    saved_record = dashboards.find_one({"_id": inserted.inserted_id})

    # Convert ObjectId → string
    saved_record["_id"] = str(saved_record["_id"])

    return saved_record


# history endpoint to retrieve all stored dashboards
@app.get("/history")
def get_history(month: int | None = Query(None), year: int | None = Query(None)):
    filter_query = {}

    # If a month + year were passed
    if month and year:
        # Convert month number into 2 digits (01 → 12)
        month_str = f"{month:02d}"
        year_str = str(year)

        # Timestamp looks like: 2025-12-09T16:49:41
        # So we filter by prefix "2025-12"
        filter_query["timestamp"] = {"$regex": f"^{year_str}-{month_str}"}
    
    records = list(dashboards.find({}))
    for r in records:
        r["_id"] = str(r["_id"])
    return records

# endpoint to retrieve a specific dashboard by its ID
@app.get("/history/{id}")
def get_dashboard(id: str):
    data = dashboards.find_one({"_id": ObjectId(id)}, {"_id": 0})
    if not data:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    return data  

        



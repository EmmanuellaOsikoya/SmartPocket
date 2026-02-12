# imports needed for backend.py
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
import re
from pymongo import MongoClient
from datetime import datetime
from fastapi import HTTPException
from bson.objectid import ObjectId
from fastapi import Query
from passlib.context import CryptContext

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

# MongoDB setup so that the uploaded dashboards can be stored
MONGO_URI = "mongodb+srv://ellaosikoya:smartpocket123@transactionhistory.euvjjnf.mongodb.net/"
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)

try:
    client.admin.command("ping")
    print("MongoDB connected successfully")
except Exception as e:
    print("MongoDB CONNECTION ERROR:", e)
     
db = client["expense_db"] # creates the database expense_db
users = db["users"] # creates a user collection in mongoDB
dashboards = db["dashboards"] # creates a collection: dashboards
budgets = db["budgets"] # creates a collection for budgets

# Password hashing setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
MAX_PASSWORD_LENGTH = 72  # bcrypt limit

def hash_password(password: str):
    # Pass string directly, no manual encoding or truncation
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str):
    return pwd_context.verify(plain, hashed)

@app.get("/ping")
def ping():
    return {"status": "pong"}

# Register endpoint that will allow a user to create an account
@app.post("/register")
def register_user(payload: dict):
    email = payload.get("email")
    password = payload.get("password")

    if not email or not password:
        raise HTTPException(400, "Email and password required")

    if len(password.encode('utf-8')) > MAX_PASSWORD_LENGTH:
        raise HTTPException(400, "Password cannot be longer than 72 characters")

    existing = users.find_one({"email": email})
    if existing:
        raise HTTPException(400, "Account already exists")

    user = {
        "email": email,
        "password": hash_password(password),
        "createdAt": datetime.now().isoformat()
    }

    users.insert_one(user)

    return {"status": "ok"}

# endpoint that allows user to login
@app.post("/login")
def login_user(payload: dict):
    email = payload.get("email")
    password = payload.get("password")

    user = users.find_one({"email": email})
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(401, "Invalid credentials")

    return {
        "userId": str(user["_id"]),
        "email": user["email"]
    }

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
async def upload_file(userId: str = Form(...), file: UploadFile = File(...)):
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
    print(f"Extracted {len(transactions)} transactions")
    if not transactions:
        raise HTTPException(400, "No transactions found")
           
    # Bank statement timestamp (for dashboard storage) 
    statement_month = transactions[0]["date"]
    statement_month = statement_month.replace("Sept", "Sep")
    statement_month = datetime.strptime(statement_month, "%d %b %Y").strftime("%Y-%m")

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
    "userId": userId, # dashboard belongs to the user that uploaded it
    "timestamp": datetime.now().isoformat(),
    "statement_month": statement_month,
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
def get_history(userId: str, month: int | None = Query(None), year: int | None = Query(None)):
    filter_query = {"userId": userId}

    # If a month + year were passed
    if month and year:
        # Convert month number into 2 digits (01 → 12)
        month_str = f"{month:02d}"
        year_str = str(year)

        # Timestamp looks like: 2025-12-09T16:49:41
        # So we filter by prefix "2025-12"
        filter_query["statement_month"] = f"{year_str}-{month_str}"
    
    records = list(dashboards.find(filter_query))
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

@app.post("/save-budget")
def save_budget(payload: dict):
    userId = payload.get("userId")
    # Extract month from timestamp-like input
    # (e.g. "2025-12", "2025-12-09T15:33:20")
    month = payload.get("month")
    total = payload.get("totalBudget")
    categories = payload.get("categories")
    
    if not month or not userId:
        raise HTTPException(400, "Month and userId required")


    # Upsert (update or insert new)
    budgets.update_one(
    {"userId": userId, "month": month},
    {
        "$set": {
            "userId": userId,
            "month": month,
            "totalBudget": total,
            "categories": categories,
            "updatedAt": datetime.utcnow().isoformat()
        }
    },
    upsert=True
)

    return {"status": "ok"}

# Endpoint that checks if the user has at least one saved budget
# Endpoint to get a specific budget for a month
@app.get("/get-budget")
def get_budget(userId: str, month: str = Query(None)):
    if month:
        # Get budget for specific month
        budget = budgets.find_one({"userId": userId, "month": month})
    else:
        # Get the most recent budget
        budget = budgets.find_one({"userId": userId}, sort=[("month", -1)])
    
    if not budget:
        return {"hasBudget": False}
    
    # Convert ObjectId to string
    budget["_id"] = str(budget["_id"])
    return budget

@app.post("/save-budget")
def save_budget(payload: dict):
    userId = payload.get("userId")
    month = payload.get("month")
    total = payload.get("totalBudget")
    categories = payload.get("categories")
    
    if not month or not userId:
        raise HTTPException(400, "Month and userId required")

    # Upsert (update or insert new)
    result = budgets.update_one(
        {"userId": userId, "month": month},
        {
            "$set": {
                "userId": userId,
                "month": month,
                "totalBudget": total,
                "categories": categories,
                "updatedAt": datetime.utcnow().isoformat()
            }
        },
        upsert=True
    )

    return {
        "status": "ok",
        "message": "Budget updated" if result.modified_count > 0 else "Budget created"
    }
    
@app.get("/has-budget")
def has_budget(userId: str):
    """
    Checks if the user has at least one budget saved.
    Used by ProgressPage before allowing statement upload.
    """
    budget = budgets.find_one({"userId": userId})

    return {
        "hasBudget": budget is not None
    }


# Update the upload-progress endpoint to use the budget for the statement's month
@app.post("/upload-progress")
async def upload_progress(
    userId: str = Form(...), 
    file: UploadFile = File(...)
):
    # Reads the PDF file
    try:
        with pdfplumber.open(file.file) as pdf:
            text = "\n".join(page.extract_text() or "" for page in pdf.pages)
    except Exception as e:
        raise HTTPException(400, f"PDF error: {e}")

    transactions = extract_transactions(text)

    if not transactions:
        raise HTTPException(400, "No transactions found")

    # Detect current statement month
    statement_month = transactions[0]["date"]
    statement_month = statement_month.replace("Sept", "Sep")
    current_month = datetime.strptime(statement_month, "%d %b %Y").strftime("%Y-%m")

    # Get user's budget for THIS specific month (or most recent if not found)
    budget = budgets.find_one({"userId": userId, "month": current_month})
    
    if not budget:
        # Try to get the most recent budget
        budget = budgets.find_one({"userId": userId}, sort=[("month", -1)])
    
    if not budget:
        raise HTTPException(404, "No budget set. Please set a budget first.")

    # Process current month like normal
    results = {"income": [], "outcome": []}

    for tx in transactions:
        if tx["amount"] > 0:
            results["income"].append(tx)
        else:
            tx["category"] = categorise_description(tx["description"])
            results["outcome"].append(tx)

    total_income = sum(tx["amount"] for tx in results["income"])
    total_outcome = sum(abs(tx["amount"]) for tx in results["outcome"])

    # Category totals for the current month
    current_categories = {}

    for tx in results["outcome"]:
        cat = tx["category"]
        current_categories[cat] = current_categories.get(cat, 0) + abs(tx["amount"])

    # Build comparison per category
    category_comparison = []

    for cat, spent_now in current_categories.items():
        budget_for_cat = budget["categories"].get(cat, 0)

        category_comparison.append({
            "category": cat,
            "current": spent_now,
            "budget": budget_for_cat,
            "overUnder": spent_now - budget_for_cat
        })
    
    # Also include categories that are in budget but have $0 spent
    for cat, budget_amount in budget["categories"].items():
        if cat not in current_categories:
            category_comparison.append({
                "category": cat,
                "current": 0,
                "budget": budget_amount,
                "overUnder": -budget_amount  # Under budget
            })

    # Final response
    return {
        "currentMonth": current_month,
        "budgetMonth": budget["month"],
        "currentTotal": total_outcome,
        "budgetTotal": budget["totalBudget"],
        "overallOverUnder": total_outcome - budget["totalBudget"],
        "categories": category_comparison
    }
    
import requests
from fastapi import HTTPException

HF_API_TOKEN = "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"
HF_MODEL_URL = "https://router.huggingface.co/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {HF_API_TOKEN}",
    "Content-Type": "application/json"
}

@app.post("/finance-chat")
async def chat_with_llm(data: dict):
    user_message = data.get("message")

    if not user_message:
        raise HTTPException(status_code=400, detail="Message is required")

    payload = {
        # Try one of these supported models:
        "model": "meta-llama/Llama-3.2-3B-Instruct",  # Good balance
        # OR "model": "microsoft/Phi-3.5-mini-instruct",  # Fast & efficient
        # OR "model": "Qwen/Qwen2.5-3B-Instruct",  # Another good option
        
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful financial assistant for SmartPocket, a budgeting app. Provide clear, concise advice about budgeting, saving, and spending."
            },
            {
                "role": "user",
                "content": user_message
            }
        ],
        "max_tokens": 150,
        "temperature": 0.7
    }

    try:
        response = requests.post(
            HF_MODEL_URL,
            headers=headers,
            json=payload,
            timeout=60
        )

        print("STATUS CODE:", response.status_code)
        print("RAW TEXT:", response.text)

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"HuggingFace error: {response.text}"
            )

        result = response.json()
        
        if "choices" in result and len(result["choices"]) > 0:
            reply = result["choices"][0]["message"]["content"]
        else:
            reply = "Sorry, I couldn't generate a response."

        return {"response": reply}

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Request failed: {str(e)}")
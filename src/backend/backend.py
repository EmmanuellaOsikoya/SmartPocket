# imports needed for backend.py
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
import re

# Initialises FastAPI application
app = FastAPI()

# Allows requests from React frontend 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Keyword-based rule system for expense categorisation
CATEGORIES = {
    "Groceries": ["Tesco", "Aldi", "Lidl", "Dunnes", "Dealz", "Grocery", "Supermarket"],
    "Rent/Ultilites": ["Rent", "Electric", "Gas", "Water", "Eir", "Wifi", "Internet"],
    "Transport": ["Burkes Bus", "Trnasport for Ireland", "Irish Rail"],
    "Healthcare": ["Pharmacy", "Doctor", "Hospital", "Clinic"],
    "Food": ["Restaraunt", "Just Eat", "SuperMacs", "McDonalds"],
    "Subscriptions": ["Spotify", "Netflix", "Cinema"]
    
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
    r"(\d{2}/\d{2})\s+(.+?)\s+(-?\d+[\.,]\d{2})"
)
# GROUP 1 → date
# GROUP 2 → description
# GROUP 3 → amount (positive = income, negative = expense)

# Function that extracts transactions using the regex pattern above
def extract_transactions(text: str):
    transactions = []
    
    # Iterates over every regex match in the PDF text
    for match in transaction_pattern.finditer(text):
        date, desc, amount = match.groups()
        
        # Converts amount to a standard float
        amount = float(amount.replace(",",""))
        
        transactions.append({
            "date": date,
            "description": desc.strip(),
            "amount": amount
        })
        
    return transactions

# FastAPI endpoint to receive the uploaded PDF file
app.post("/upload")
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
        
        
    return results          



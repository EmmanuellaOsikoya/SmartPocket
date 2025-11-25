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



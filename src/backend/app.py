# The purpose of app.py is to do the following:
# Accepts a bank-statment PDF from the frontend
# Extracts the text using pdfplumber
# Splits the text into lines representing transactions
# Uses FinBERT to classify spending as income/outcome
# Categorises outcome transactions into spending categories
# Returns JSON results to the frontend

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
import uvicorn
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import re

# Initialises FastAPI
app = FastAPI()

# Allows React frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Loads the FinBERT (finance-specific BERT) model tgat is responsible ofr analysing Positive, Neutral, and Negative sentiment
tokenizer = AutoTokenizer.from_pretrained("yiyanghkust/finbert-tone")
model = AutoModelForSequenceClassification.from_pretrained("yiyanghkust/finbert-tone")

id2label = {0: "neutral", 1: "positive", 2: "negative"}

# Function responsible for categorisiing outcome transactions
def categorise_expense(text: str) -> str:
    """Maps transaction descriptions to spending categories."""
    text_lower = text.lower()
    
    if any(word in text_lower for word in ["tesco", "aldi", "lidl", "grocery", "supermarket", "shop"]):
        return "Groceries"
    
    if any(word in text_lower for word in ["rent", "electric", "gas", "water", "utilities", "eir", "wifi", "internet"]):
        return "Rent/Utilities"
    
    if any(word in text_lower for word in ["netflix", "spotify", "prime", "subscription", "gomo"]):
        return "Subscriptions"

    if any(word in text_lower for word in ["cinema", "restaurant", "pub", "game", "travel", "nintendo"]):
        return "Recreational"

    return "Misc"


# Function that runs FinBERT on each transaction
def classify_transaction(text: str):
    """Classifies the transaction as income or expense using FinBERT."""
    inputs = tokenizer(text, return_tensors="pt", truncation=True)

    with torch.no_grad():
        outputs = model(**inputs)

    logits = outputs.logits
    predicted_class = torch.argmax(logits, dim=1).item()
    sentiment = id2label[predicted_class]

    # Map FinBERT sentiment to our categories
    if sentiment == "positive":
        return "Income"

    if sentiment == "negative":
        return "Outcome"

    return "Unclassified"

# Endpoint that uploads and processes pdf
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Receives a PDF from the frontend, extracts text,
    splits lines into transactions, runs FinBERT classification,
    categorises outcome expenses, and returns structured JSON.
    """
    
    # Extracts text from pdf
    try:
        with pdfplumber.open(file.file) as pdf:
            text = "\n".join(page.extract_text() or "" for page in pdf.pages)

    except Exception as e:
        return {"error": f"Failed to read PDF: {str(e)}"}
    
    # CLeans and splits into transaction lines
    # Also removes empty lines and whitespace
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    
    results = {
        "income": [],
        "outcome": [],
        "unclassified": []
    }
    
    # Processes each transaction line
    for line in lines:
        classification = classify_transaction(line)

        if classification == "Income":
            results["income"].append(line)

        elif classification == "Outcome":
            category = categorise_expense(line)
            results["outcome"].append({
                "transaction": line,
                "category": category
            })

        else:
            results["unclassified"].append(line)
            
        # Returns processed results to the frontend
        return results


from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
import uvicorn

app = FastAPI()

# Allow React frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # Read text from PDF
    try:
        with pdfplumber.open(file.file) as pdf:
            text = "\n".join(page.extract_text() or "" for page in pdf.pages)
    except:
        return {"error": "Could not read PDF"}

    # Placeholder for FinBERT categorisation
    # TODO: replace with real ML model later
    fake_categories = {
        "raw_text": text[:500],   # send first 500 characters for debugging
        "message": "PDF received successfully. ML model not implemented yet.",
        "categories": {
            "Groceries": 120.50,
            "Rent": 800,
            "Subscriptions": 30,
            "Utilities": 60
        }
    }

    return fake_categories


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)

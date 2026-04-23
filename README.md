# SmartPocket – Personal Finance Tracker

SmartPocket is a full-stack personal finance application that allows users to track income and expenses, set budgets, analyse spending behaviour, and receive AI-powered financial insights.

---

## Features

- Track income and expenses  
- Categorise transactions automatically  
- Create and manage monthly budgets  
- View interactive financial dashboards  
- AI-powered financial assistant (Hugging Face integration)  
- Progress tracking and reporting  

---

## Tech Stack

- Frontend: React, TypeScript, Tailwind CSS, Recharts  
- Backend: FastAPI (Python)  
- Database: MongoDB (local instance)  
- AI Integration: Hugging Face Transformers  

---

## Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/EmmanuellaOsikoya/SmartPocket.git
cd SmartPocket
```

---

### 2. Create a Virtual Environment (venv)

The virtual environment is not included in the repository and must be created locally.

```bash
python -m venv venv
```

#### Activate it:

**Windows**
```bash
venv\Scripts\activate
```

**Mac/Linux**
```bash
source venv/bin/activate
```

---

### 3. Database Setup (Local MongoDB)

This project uses a local MongoDB instance. Each user runs their own database.

#### Install MongoDB

Download MongoDB Community Edition:  
https://www.mongodb.com/try/download/community

#### Start MongoDB

```bash
mongod
```

MongoDB will run on:

```
mongodb://localhost:27017
```

#### Database Usage

The application will automatically create the database:

```
smartpocket
```

when the backend is running and data is added.

#### Optional: Load Sample Data

```bash
mongorestore database-dump/
```

---

### 5. Environment Variables (.env)

Create a `.env` file in the backend root folder:

```bash
touch .env
```

Add the following:

```env
MONGO_URI=mongodb://localhost:27017/smartpocket
HUGGINGFACE_TOKEN=your_token_here
```

#### .env Example

Create a `.env.example` file:

```env
MONGO_URI=mongodb://localhost:27017/smartpocket
HUGGINGFACE_TOKEN=your_token_here
```

---

### 6. Hugging Face Token Setup

This project uses Hugging Face for AI-powered financial insights.

Steps:

1. Go to https://huggingface.co  
2. Create an account or log in  
3. Go to Settings  
4. Select "Access Tokens"  
5. Click "New Token"  
6. Set:
   - Name: smartpocket  
   - Role: Write  
7. Copy the token  

Add it to your `.env` file:

```env
HUGGINGFACE_TOKEN=hf_xxxxxxxxxxxxxxxxx
```

---

### 7. Run the Backend

```bash
uvicorn main:app --reload
```

---

### 8. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

---
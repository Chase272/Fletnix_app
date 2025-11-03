# 🎬 Fletnix

**Fletnix** is a web-based application that provides structured, searchable access to textual data about Netflix shows and movies.  


You can look at https://fletnix-frontend-three.vercel.app/
---

## ✨ Features

- 🔍 **Search & Filter:** Instantly search shows and movies by name, genre, or type  
- 👤 **User Accounts:** Register and log in to maintain your preferences  
- 📺 **Personal Watchlist:** Add or remove shows from your own watchlist  
- ⚡ **Fast Backend:** Built with **FastAPI** for performance and scalability  
- 🧠 **MongoDB Data Layer:** All title data and user information stored in MongoDB  
- 💡 **Modern Frontend:** Angular + TypeScript UI with responsive layout  

---

## 🧩 Tech Stack
- **Frontend:** Angular, TypeScript, HTML, CSS  
- **Backend:** FastAPI (Python), Uvicorn  
- **Database:** MongoDB Atlas  
- **Deployment:** Vercel (Frontend + Backend)

---
## 🚀 Project Structure

FletNix/
│
├── backend/ # FastAPI + MongoDB backend
├── frontend/ # Angular frontend
└── README.md # This file

yaml
Copy code

---

## 🧩 Requirements

Before running the project, ensure you have the following installed:

- **Python 3.10+**
- **Node.js 18+**
- **npm** or **yarn**
- **MongoDB** (local or cloud e.g. MongoDB Atlas)
- **Angular** (local or cloud e.g. MongoDB Atlas)

---

## ⚙️ 1. Setup & Run the Backend (FastAPI)

### 🪶 Step 1 — Navigate to backend folder and install python dependencies

cd backend
pip install -r requirements.txt
### 🪶 Step 2 — Create a .env file to connect to Mongo Server
Create a .env file in the backend/ directory:
with
MONGO_URL="your_mongodb_connection_string"

### 🪶 Step 3 — Run the FastAPI server
uvicorn main:app --reload

The backend will be running at "http://localhost:8000"
For API Docs you can visit "http://localhost:8000/docs'"

### 💻 2. Setup & Run the Frontend (Angular)
### 🪶 Step 1 — Navigate to frontend folder and install dependencies
cd frontend
npm install

### 🪶 Step 2 — Set up API URL
src/environments/environment.ts

Ensure it points to your backend:

export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8000' #for local servers 
  }

### 🪶 Step 3 — Run the Angular app
ng serve
Frontend will start at:
👉 http://localhost:4200 try creating a user and logging in.

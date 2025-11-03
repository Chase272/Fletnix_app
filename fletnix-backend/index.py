from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.middleware.cors import CORSMiddleware
import os 
from pymongo import MongoClient , errors
import bcrypt
import re

app = FastAPI(title="Fletnix Backend")
uri = os.getenv("MONGO_URI")


try:

    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    db = client["fletnix"]
    users = db["users"]
    shows_collection = db["netflix_titles"]
except errors.ServerSelectionTimeoutError:
    raise HTTPException(status_code=503, detail="Failed to connect to MongoDB cluster")
except Exception as e:
    raise HTTPException(status_code=500, detail=f"MongoDB connection error: {str(e)}")


# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Register ---
@app.post("/register")
async def register(request: Request):
    data = await request.json()
    email = data.get("email")
    password = data.get("password")
    age = data.get("age")

    if not email or not password or age is None:
        raise HTTPException(400, "Missing fields")

    if users.find_one({"email": email}):
        raise HTTPException(400, "Email already exists")

    hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    users.insert_one({"email": email, "password": hashed_pw, "age": age, "watchlist":[]})
    return {"message": "User registered successfully"}

# --- Login ---
@app.post("/login")
async def login(request: Request):
    data = await request.json()
    email = data.get("email")
    password = data.get("password")

    user = users.find_one({"email": email})
    if not user or not bcrypt.checkpw(password.encode(), user["password"].encode()):
        raise HTTPException(401, "Invalid email or password")

    return {"message": "Login successful", "email": user["email"], "age": user["age"]}



# --- GET /shows ---
@app.get("/titles")
def get_all_shows(age: int = 0,type:str = "all", page:int = 0, limit:int = 15):
    """
    Fetch all titles. If 'age' is provided and user < 18,
    exclude shows rated 'R'.
    """
    limit = 15
    skip = (page-1)*limit
    query = {}
    if age is not None and age < 18:
        query["rating"] = {"$ne": "R"}  
    if type != "All":
        query["type"] = "TV Show" if type == "TV" else "Movie"
    
    total = shows_collection.count_documents(query)
    print(shows_collection.find(query, {"_id": 0}))
    titles = list(shows_collection.find(query, {"_id": 0}).skip(skip).limit(limit))  
    if not titles:
        raise HTTPException(status_code=404, detail="No shows found")

    return {"total": total, "page": page, "limit": limit, "data": titles}



# --- GET show details by show_id ---
@app.get("/titles/details/{show_id}")
def get_show_details(show_id: str):
    """
    Fetch detailed info for a single title by its show_id (e.g. s1, s2, ...).
    Returns all metadata fields.
    """
    show = shows_collection.find_one({"show_id": show_id}, {"_id": 0})
    
    if not show:
        raise HTTPException(status_code=404, detail=f"Show with id '{show_id}' not found")

    return show

# --- GET user watchlist ---
@app.get("/titles/watchlist")
def get_watchlist_details(email: str):
    """
        Get Watchlist titles by User
    """
    user = users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="No User Found")

    watchlist = user.get("watchlist", [])
    if not watchlist:
        return {"message": "Watchlist is empty", "shows": []}

    # Fetch all shows where show_id is in the user's watchlist
    shows = list(shows_collection.find(
        {"show_id": {"$in": watchlist}},
        {"_id": 0}  # exclude MongoDB internal _id field
    ))

    return {"count": len(shows), "shows": shows}

# --- POST new show to watchlist ---
@app.post("/titles/watchlist")
def add_to_watchlist(email: str, show_id: str):
    """
    Add a show to the user's watchlist.
    """
    user = users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="No User Found")


    if show_id in user.get("watchlist", []):
        raise HTTPException(status_code=400, detail="Show already in watchlist")

    result = users.update_one(
        {"email": email},
        {"$push": {"watchlist": show_id}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to update watchlist")

    return {"message": f"Show {show_id} added to {email}'s watchlist successfully"}


# --- DELETE show from watchlist ---
@app.delete("/titles/watchlist")
def delete_from_watchlist(email: str, show_id: str):
    """
    Quickly remove a show from user's watchlist
    """
    result = users.update_one(
        {"email": email},
        {"$pull": {"watchlist": show_id}}
    )

    if result.matched_count == 0:
        raise HTTPException(404, "User not found")

    return {"message": "Removed from watchlist"}


# --- GET show by search query ---
@app.get("/title/search")
def search_titles(
    q: str,
    age: int = 0,
    limit: int = 15
):
    """
    Search shows by title or cast.
    Handles both plain strings and arrays of cast names.
    Case-insensitive partial match via regex.
    """
    q = q.strip()
    if not q:
        raise HTTPException(status_code=400, detail="Empty search query")

    if len(q) < 3:
        regex = {"$regex": re.escape(q), "$options": "i"}  # partial
    else:
        regex =  {"$regex": fr"\b{re.escape(q)}\b", "$options": "i"}
    


    query = {
        "$or": [
            {"title": regex},       # match title text
            {"cast": regex}         # match inside array of strings
        ]
    }

    if age is not None and age < 18:
        query["rating"] = {"$ne": "R"}

    results = list(shows_collection.find(query, {"_id": 0}).limit(limit))



    return {"count": len(results), "results": results}

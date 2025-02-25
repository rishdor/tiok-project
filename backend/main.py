import logging
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import requests
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app_logger")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

JSONPLACEHOLDER_URL = "https://jsonplaceholder.typicode.com"
display_limit = 10

class LimitRequest(BaseModel):
    limit: int

@app.get("/api/posts")
def get_posts():
    try:
        response = requests.get(f"{JSONPLACEHOLDER_URL}/posts")
        response.raise_for_status()
        data = response.json()[:display_limit]
        return data
    except Exception as e:
        logger.error("Error fetching posts: %s", e)
        raise HTTPException(status_code=500, detail="Error fetching posts")

@app.get("/api/users")
def get_users():
    try:
        response = requests.get(f"{JSONPLACEHOLDER_URL}/users")
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error("Error fetching users: %s", e)
        raise HTTPException(status_code=500, detail="Error fetching users")

@app.get("/api/comments")
def get_comments():
    try:
        response = requests.get(f"{JSONPLACEHOLDER_URL}/comments")
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error("Error fetching comments: %s", e)
        raise HTTPException(status_code=500, detail="Error fetching comments")

@app.get("/api/albums")
def get_albums():
    try:
        response = requests.get(f"{JSONPLACEHOLDER_URL}/albums")
        response.raise_for_status()
        data = response.json()[:display_limit]
        return data
    except Exception as e:
        logger.error("Error fetching albums: %s", e)
        raise HTTPException(status_code=500, detail="Error fetching albums")

@app.get("/api/photos")
def get_photos(album_id: int = Query(..., description="The ID of the album to fetch photos for")):
    try:
        logger.info(f"Fetching photos for album_id: {album_id}")
        response = requests.get(f"{JSONPLACEHOLDER_URL}/photos?albumId={album_id}")
        response.raise_for_status()
        data = response.json()[:display_limit]
        return data
    except Exception as e:
        logger.error("Error fetching photos: %s", e)
        raise HTTPException(status_code=500, detail="Error fetching photos")

@app.get("/api/limit")
def get_limit():
    return {"limit": display_limit}

@app.post("/api/limit")
def set_limit(limit_request: LimitRequest):
    global display_limit
    try:
        if limit_request.limit < 1:
            raise ValueError("Limit must be at least 1")
        display_limit = limit_request.limit
        logger.info("Display limit updated to %s", display_limit)
        return {"limit": display_limit}
    except Exception as e:
        logger.error("Error setting limit: %s", e)
        raise HTTPException(status_code=400, detail=str(e))

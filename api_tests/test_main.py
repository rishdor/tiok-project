import pytest
from fastapi.testclient import TestClient
from backend.main import app, display_limit

client = TestClient(app)

class FakeResponse:
    def __init__(self, json_data, status_code=200):
        self._json = json_data
        self.status_code = status_code

    def json(self):
        return self._json

    def raise_for_status(self):
        if self.status_code >= 400:
            raise Exception("HTTP error")

def fake_requests_get(url, *args, **kwargs):
    if "posts" in url:
        return FakeResponse([{"id": i, "title": f"Post {i}", "body": "A" * 50, "userId": 1} for i in range(1, 21)])
    elif "users" in url:
        return FakeResponse([{"id": 1, "name": "User1"}])
    elif "comments" in url:
        return FakeResponse([{"id": i, "postId": 1, "name": f"Comment {i}", "body": "Comment body", "email": "user@example.com"} for i in range(1, 6)])
    elif "albums" in url:
        return FakeResponse([{"id": i, "title": f"Album {i}", "userId": 1} for i in range(1, 21)])
    elif "photos" in url:
        return FakeResponse([{"id": i, "albumId": 1, "title": f"Photo {i}", "thumbnailUrl": f"http://example.com/photo{i}.jpg"} for i in range(1, 21)])
    else:
        return FakeResponse([], 404)

def fake_requests_get_error(url, *args, **kwargs):
    raise Exception("Simulated error")

@pytest.fixture(autouse=True)
def patch_requests_get(monkeypatch):
    monkeypatch.setattr("backend.main.requests.get", fake_requests_get)

@pytest.fixture(autouse=True)
def reset_display_limit():
    global display_limit
    display_limit = 10

def test_get_posts():
    response = client.get("/api/posts")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 10
    assert "id" in data[0] and "title" in data[0]

def test_get_users():
    response = client.get("/api/users")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert "id" in data[0] and "name" in data[0]

def test_get_comments():
    response = client.get("/api/comments")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert "id" in data[0] and "postId" in data[0]

def test_get_albums():
    response = client.get("/api/albums")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 10

def test_get_photos():
    response = client.get("/api/photos?album_id=1")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 10
    assert "id" in data[0] and "albumId" in data[0]

def test_get_limit():
    response = client.get("/api/limit")
    assert response.status_code == 200
    data = response.json()
    assert "limit" in data

def test_set_limit_valid():
    new_limit = 12
    response = client.post("/api/limit", json={"limit": new_limit})
    assert response.status_code == 200
    data = response.json()
    assert data["limit"] == new_limit

def test_set_limit_invalid():
    response = client.post("/api/limit", json={"limit": 0})
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data

def test_get_posts_error(monkeypatch):
    monkeypatch.setattr("backend.main.requests.get", fake_requests_get_error)
    response = client.get("/api/posts")
    assert response.status_code == 500
    data = response.json()
    assert "detail" in data

def test_get_users_error(monkeypatch):
    monkeypatch.setattr("backend.main.requests.get", fake_requests_get_error)
    response = client.get("/api/users")
    assert response.status_code == 500
    data = response.json()
    assert "detail" in data

def test_get_comments_error(monkeypatch):
    monkeypatch.setattr("backend.main.requests.get", fake_requests_get_error)
    response = client.get("/api/comments")
    assert response.status_code == 500
    data = response.json()
    assert "detail" in data

def test_get_albums_error(monkeypatch):
    monkeypatch.setattr("backend.main.requests.get", fake_requests_get_error)
    response = client.get("/api/albums")
    assert response.status_code == 500
    data = response.json()
    assert "detail" in data

def test_get_photos_error(monkeypatch):
    monkeypatch.setattr("backend.main.requests.get", fake_requests_get_error)
    response = client.get("/api/photos?album_id=1")
    assert response.status_code == 500
    data = response.json()
    assert "detail" in data

def test_get_photos_invalid_album_id():
    response = client.get("/api/photos?album_id=invalid")
    assert response.status_code == 422 

def test_set_limit_negative():
    response = client.post("/api/limit", json={"limit": -5})
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data

def test_set_limit_zero():
    response = client.post("/api/limit", json={"limit": 0})
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data

def test_set_limit_string():
    response = client.post("/api/limit", json={"limit": "string"})
    assert response.status_code == 422

def test_get_photos_no_album_id():
    response = client.get("/api/photos")
    assert response.status_code == 422
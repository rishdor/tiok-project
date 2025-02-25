import requests
import json
from jsonschema import validate

# external api tests (jsonplaceholder)
def test_jsonplaceholder_posts_contract():
    with open('schemas/post_schema.json') as f:
        post_schema = json.load(f)

    response = requests.get("https://jsonplaceholder.typicode.com/posts")
    assert response.status_code == 200

    posts = response.json()
    assert isinstance(posts, list)

    for post in posts:
        validate(instance=post, schema=post_schema)

def test_jsonplaceholder_users_contract():
    with open('schemas/user_schema.json') as f:
        user_schema = json.load(f)

    response = requests.get("https://jsonplaceholder.typicode.com/users")
    assert response.status_code == 200

    users = response.json()
    assert isinstance(users, list)

    for user in users:
        validate(instance=user, schema=user_schema)

def test_jsonplaceholder_comments_contract():
    with open('schemas/comment_schema.json') as f:
        comment_schema = json.load(f)

    response = requests.get("https://jsonplaceholder.typicode.com/comments")
    assert response.status_code == 200

    comments = response.json()
    assert isinstance(comments, list)

    for comment in comments:
        validate(instance=comment, schema=comment_schema)

def test_jsonplaceholder_albums_contract():
    with open('schemas/album_schema.json') as f:
        album_schema = json.load(f)

    response = requests.get("https://jsonplaceholder.typicode.com/albums")
    assert response.status_code == 200

    albums = response.json()
    assert isinstance(albums, list)

    for album in albums:
        validate(instance=album, schema=album_schema)

def test_jsonplaceholder_photos_contract():
    with open('schemas/photo_schema.json') as f:
        photo_schema = json.load(f)

    response = requests.get("https://jsonplaceholder.typicode.com/photos?albumId=1")
    assert response.status_code == 200

    photos = response.json()
    assert isinstance(photos, list)

    for photo in photos:
        validate(instance=photo, schema=photo_schema)

# internal contract tests (my api)
def test_get_posts_contract():
    with open('schemas/post_schema.json') as f:
        post_schema = json.load(f)

    response = requests.get("http://localhost:8000/api/posts")
    assert response.status_code == 200

    posts = response.json()
    assert isinstance(posts, list)

    for post in posts:
        validate(instance=post, schema=post_schema)

def test_get_users_contract():
    with open('schemas/user_schema.json') as f:
        user_schema = json.load(f)

    response = requests.get("http://localhost:8000/api/users")
    assert response.status_code == 200

    users = response.json()
    assert isinstance(users, list)

    for user in users:
        validate(instance=user, schema=user_schema)

def test_get_comments_contract():
    with open('schemas/comment_schema.json') as f:
        comment_schema = json.load(f)

    response = requests.get("http://localhost:8000/api/comments")
    assert response.status_code == 200

    comments = response.json()
    assert isinstance(comments, list)

    for comment in comments:
        validate(instance=comment, schema=comment_schema)

def test_get_albums_contract():
    with open('schemas/album_schema.json') as f:
        album_schema = json.load(f)

    response = requests.get("http://localhost:8000/api/albums")
    assert response.status_code == 200

    albums = response.json()
    assert isinstance(albums, list)

    for album in albums:
        validate(instance=album, schema=album_schema)

def test_get_photos_contract():
    with open('schemas/photo_schema.json') as f:
        photo_schema = json.load(f)

    response = requests.get("http://localhost:8000/api/photos?album_id=1")
    assert response.status_code == 200

    photos = response.json()
    assert isinstance(photos, list)

    for photo in photos:
        validate(instance=photo, schema=photo_schema)

def test_get_limit_contract():
    response = requests.get("http://localhost:8000/api/limit")
    assert response.status_code == 200

    limit = response.json()
    assert isinstance(limit, dict)
    assert "limit" in limit
    assert isinstance(limit["limit"], int)

def test_set_limit_contract():
    new_limit = {"limit": 5}
    response = requests.post("http://localhost:8000/api/limit", json=new_limit)
    assert response.status_code == 200

    limit = response.json()
    assert isinstance(limit, dict)
    assert "limit" in limit
    assert limit["limit"] == new_limit["limit"]
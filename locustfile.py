from locust import HttpUser, task, between

class APIUser(HttpUser):
    wait_time = between(1, 10)

    @task(1)
    def get_posts(self):
        self.client.get("/api/posts")
    
    @task(1)
    def get_albums(self):
        self.client.get("/api/albums")
    
    @task(1)
    def get_limit(self):
        self.client.get("/api/limit")
    
    @task(1)
    def set_limit(self):
        # For performance testing, we simulate setting the limit to 10.
        self.client.post("/api/limit", json={"limit": 10})
    
    @task(1)
    def get_photos(self):
        # Test endpoint for photos using album_id=1
        self.client.get("/api/photos", params={"album_id": 1})

import React, { useState, useEffect } from 'react';
import '../App.css';

function Posts() {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [minLength, setMinLength] = useState(0);
  const [maxLength, setMaxLength] = useState(1000);
  const [displayLimit, setDisplayLimit] = useState(10); 
  const [newLimit, setNewLimit] = useState(10); 

  const fetchData = () => {
    Promise.all([
      fetch('http://localhost:8000/api/posts').then(res => res.json()),
      fetch('http://localhost:8000/api/users').then(res => res.json()),
      fetch('http://localhost:8000/api/comments').then(res => res.json())
    ])
      .then(([postsData, usersData, commentsData]) => {
        setPosts(postsData);
        setUsers(usersData);
        setComments(commentsData);
      })
      .catch(err => console.error('Error fetching data:', err));
  };

  useEffect(() => {
    fetch('http://localhost:8000/api/limit')
      .then(res => res.json())
      .then(data => {
         setDisplayLimit(data.limit);
         setNewLimit(data.limit);
      })
      .catch(err => console.error('Error fetching display limit:', err));
    fetchData();
  }, []);

  const filteredPosts = posts.filter(post => {
    const length = post.body.length;
    return length >= minLength && length <= maxLength;
  });

  const updateLimit = () => {
    fetch('http://localhost:8000/api/limit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ limit: Number(newLimit) })
    })
      .then(res => res.json())
      .then(data => {
         setDisplayLimit(data.limit);
         fetchData();
      })
      .catch(err => console.error('Error updating display limit:', err));
  };

  return (
    <div className="posts-page">
      <h1>Posts</h1>
      <div className="filter-container">
        <label>
          Min Length:
          <input
            type="number"
            value={minLength}
            onChange={(e) => setMinLength(Number(e.target.value))}
          />
        </label>
        <label>
          Max Length:
          <input
            type="number"
            value={maxLength}
            onChange={(e) => setMaxLength(Number(e.target.value))}
          />
        </label>
      </div>
      <div className="limit-container">
        <label>
          Display Limit:
          <input
            type="number"
            value={newLimit}
            onChange={(e) => setNewLimit(Number(e.target.value))}
          />
        </label>
        <button onClick={updateLimit}>Set Limit</button>
      </div>
      {filteredPosts.length > 0 ? (
        filteredPosts.map(post => {
          const user = users.find(u => u.id === post.userId);
          const postComments = comments.filter(comment => comment.postId === post.id);
          return (
            <div className="post-container" key={post.id}>
              <div className="single-post">
                <div className="post-title">{post.title}</div>
                <br />
                <div className="post-written-by">
                  Written by: {user ? user.name : "Unknown"}
                </div>
                <br />
                <div className="post-body">{post.body}</div>
              </div>
              <div className="comments">
                <span>Comments</span>
                <div className="comments-container">
                  {postComments.map(comment => (
                    <div className="comment" key={comment.id}>
                      <div className="comment-title">{comment.name}</div>
                      <div className="comment-body">{comment.body}</div>
                      <div className="comment-email">{comment.email}</div>
                    </div> 
                  ))}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p>No posts available</p>
      )}
    </div>
  );
}

export default Posts;
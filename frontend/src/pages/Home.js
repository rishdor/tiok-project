import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home">
      <h1>Welcome to JSONPlaceholder Consumer</h1>
      <p>Select a page to view:</p>
      <ul>
        <li><Link to="/posts">Posts</Link></li>
        <li><Link to="/albums">Albums</Link></li>
        <li><Link to="/photos">Photos</Link></li>
      </ul>
    </div>
  );
}

export default Home;
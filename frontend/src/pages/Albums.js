import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Albums() {
  const [albums, setAlbums] = useState([]);
  const [limit, setLimit] = useState(10);
  const [displayLimit, setDisplayLimit] = useState(10); 
  const [newLimit, setNewLimit] = useState(10); 
  const navigate = useNavigate();

  const fetchAlbums = () => {
    fetch(`http://localhost:8000/api/albums?limit=${limit}`)
      .then(res => res.json())
      .then(data => setAlbums(data))
      .catch(err => console.error('Error fetching albums:', err));
  };
  
  useEffect(() => {
    fetch('http://localhost:8000/api/limit')
      .then(res => res.json())
      .then(data => {
        setDisplayLimit(data.limit);
        setNewLimit(data.limit);
      })
      .catch(err => console.error('Error fetching display limit:', err));
    fetchAlbums();
  }, []);

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
        fetchAlbums();
      })
      .catch(err => console.error('Error updating display limit:', err));
  };

  const openAlbum = (id) => {
    navigate(`/photos?albumId=${id}`);
  };

  return (
    <div className="albums-page">
      <h1>Albums</h1>
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
      {albums.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>UserID</th>
            </tr>
          </thead>
          <tbody>
            {albums.map(album => (
              <tr key={album.id} data-testid={`album-row-${album.id}`} onClick={() => openAlbum(album.id)}>
                <td>{album.id}</td>
                <td>{album.title}</td>
                <td>{album.userId}</td>
              </tr>          
            ))}
          </tbody>
        </table>
      ) : (
        <p>No albums available</p>
      )}
    </div>
  );
}

export default Albums;
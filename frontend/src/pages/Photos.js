import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function Photos() {
  const location = useLocation();
  const [photos, setPhotos] = useState([]);
  const [displayLimit, setDisplayLimit] = useState(10);
  const [newLimit, setNewLimit] = useState(10);

  const fetchPhotos = (albumId) => {
    console.log(`Fetching photos for albumId: ${albumId}`);
    fetch(`http://localhost:8000/api/photos?album_id=${albumId}&limit=${displayLimit}`)
      .then(res => res.json())
      .then(data => {
        console.log('Fetched photos:', data);
        setPhotos(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error('Error fetching photos:', err));
  };

  useEffect(() => {
    fetch('http://localhost:8000/api/limit')
      .then(res => res.json())
      .then(data => {
        setDisplayLimit(data.limit);
        setNewLimit(data.limit);
      })
      .catch(err => console.error('Error fetching display limit:', err));

    const params = new URLSearchParams(location.search);
    const albumId = params.get('albumId');
    console.log('Album ID:', albumId); 
    if (albumId) {
      fetchPhotos(albumId);
    }
  }, [location]);

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
        const params = new URLSearchParams(location.search);
        const albumId = params.get('albumId');
        if (albumId) {
          fetchPhotos(albumId);
        }
      })
      .catch(err => console.error('Error updating display limit:', err));
  };

  const params = new URLSearchParams(location.search);
  const albumId = params.get('albumId');

  if (!albumId) {
    return <p>No album selected</p>;
  }

  return (
    <div className="photos-page">
      <h1>Photos</h1>
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
      <div className="photos-grid">
        {Array.isArray(photos) && photos.length > 0 ? (
          photos.map(photo => (
            <div key={photo.id} className="photo-item">
              <img src={photo.thumbnailurl} alt={photo.title} />
              <p>{photo.title}</p>
            </div>
          ))
        ) : (
          <p>No photos available</p>
        )}
      </div>
    </div>
  );
}

export default Photos;
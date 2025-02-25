import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import Photos from '../pages/Photos';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useLocation: jest.fn(),
  };
});

const mockUseLocation = useLocation;

beforeEach(() => {
  global.fetch = jest.fn((url, options) => {
    if (url.includes('/api/photos')) {
      return Promise.resolve({
        json: () => Promise.resolve([
          { id: 1, albumId: 1, title: 'Photo 1', thumbnailurl: 'http://example.com/photo1.jpg' },
          { id: 2, albumId: 1, title: 'Photo 2', thumbnailurl: 'http://example.com/photo2.jpg' },
        ]),
      });
    } else if (url.includes('/api/limit') && (!options || options.method === 'GET')) {
      return Promise.resolve({
        json: () => Promise.resolve({ limit: 10 }),
      });
    } else if (url.includes('/api/limit') && options && options.method === 'POST') {
      const body = JSON.parse(options.body);
      return Promise.resolve({
        json: () => Promise.resolve({ limit: body.limit }),
      });
    }
    return Promise.reject(new Error('Unknown API endpoint'));
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

test('fetches photos for a given album', async () => {
  mockUseLocation.mockReturnValue({ search: '?albumId=1' });

  render(
    <Router>
      <Photos />
    </Router>
  );

  await waitFor(() => {
    expect(screen.getByText(/Photo 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Photo 2/i)).toBeInTheDocument();
  });
});

test('updates display limit and re-fetches photos', async () => {
  mockUseLocation.mockReturnValue({ search: '?albumId=1' });

  render(
    <Router>
      <Photos />
    </Router>
  );

  fireEvent.change(screen.getByLabelText(/Display Limit/i), { target: { value: '5' } });
  fireEvent.click(screen.getByText(/Set Limit/i));

  await waitFor(() => {
    expect(screen.getByLabelText(/Display Limit/i).value).toBe('5');
  });

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/limit',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 5 }),
      })
    );
  });

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/photos?album_id=1&limit=5',
      expect.objectContaining({
        method: 'GET',
      })
    );
  });
});

test('shows "No photos available" if an empty array is returned', async () => {
  global.fetch = jest.fn((url) => {
    if (url.includes('/api/photos')) {
      return Promise.resolve({
        json: () => Promise.resolve([]),
      });
    } else if (url.includes('/api/limit')) {
      return Promise.resolve({
        json: () => Promise.resolve({ limit: 10 }),
      });
    }
    return Promise.reject(new Error('Unknown API endpoint'));
  });

  mockUseLocation.mockReturnValue({ search: '?albumId=1' });

  render(
    <Router>
      <Photos />
    </Router>
  );

  await waitFor(() => {
    expect(screen.getByText(/No photos available/i)).toBeInTheDocument();
  });
});

test('handles missing albumId param gracefully', async () => {
  mockUseLocation.mockReturnValue({ search: '' });

  render(
    <Router>
      <Photos />
    </Router>
  );

  await waitFor(() => {
    expect(screen.getByText(/No album selected/i)).toBeInTheDocument();
  });
});
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Albums from '../pages/Albums';
import { MemoryRouter } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: jest.fn(),
  };
});

const mockedNavigate = jest.fn();
useNavigate.mockReturnValue(mockedNavigate);

beforeEach(() => {
  global.fetch = jest.fn((url, options) => {
    if (url.includes('/api/limit') && (!options || options.method === 'GET')) {
      return Promise.resolve({
        json: () => Promise.resolve({ limit: 10 }),
      });
    }
    if (url.includes('/api/limit') && options && options.method === 'POST') {
      const body = JSON.parse(options.body);
      return Promise.resolve({
        json: () => Promise.resolve({ limit: body.limit }),
      });
    }
    if (url.includes('/api/albums')) {
      const albums = [
        { id: 1, title: "Album 1", userId: 1 },
        { id: 2, title: "Album 2", userId: 1 },
      ];
      return Promise.resolve({
        json: () => Promise.resolve(albums),
      });
    }
    return Promise.resolve({
      json: () => Promise.resolve([]),
    });
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

test('renders albums and displays limit control', async () => {
  render(
    <MemoryRouter>
      <Albums />
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByText(/Album 1/i)).toBeInTheDocument();
  });

  expect(screen.getByDisplayValue("10")).toBeInTheDocument();
});

test('updates display limit when "Set Limit" button is clicked', async () => {
  render(
    <MemoryRouter>
      <Albums />
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByDisplayValue("10")).toBeInTheDocument();
  });

  const displayLimitInput = screen.getByLabelText(/Display Limit/i);
  fireEvent.change(displayLimitInput, { target: { value: '5' } });

  const updateButton = screen.getByText(/Set Limit/i);
  fireEvent.click(updateButton);

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
});

// test('navigates to photos page when an album row is clicked', async () => {
//   render(
//     <MemoryRouter>
//       <Albums />
//     </MemoryRouter>
//   );

//   await waitFor(() => {
//     expect(screen.getByText(/Album 1/i)).toBeInTheDocument();
//   });

//   const albumRow = screen.getByText(/Album 1/i).closest('tr');
//   fireEvent.click(albumRow);

//   await waitFor(() => {
//     expect(mockedNavigate).toHaveBeenCalledWith('/photos?albumId=1');
//   });
// });

test('handles empty data scenario', async () => {
  global.fetch = jest.fn((url) => {
    if (url.includes('/api/albums')) {
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

  render(
    <MemoryRouter>
      <Albums />
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByText(/No albums available/i)).toBeInTheDocument();
  });
});
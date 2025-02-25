import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Posts from '../pages/Posts';

beforeEach(() => {
  global.fetch = jest.fn((url, options) => {
    if (url.includes('/api/limit') && (!options || options.method === 'GET')) {
      return Promise.resolve({
        json: () => Promise.resolve({ limit: 10 })
      });
    }
    if (url.includes('/api/limit') && options && options.method === 'POST') {
      const body = JSON.parse(options.body);
      return Promise.resolve({
        json: () => Promise.resolve({ limit: body.limit })
      });
    }
    if (url.includes('/api/posts')) {
      const posts = [
        { id: 1, title: "Post 1", body: "This is a sample post", userId: 1 },
        { id: 2, title: "Post 2", body: "Another post content", userId: 1 }
      ];
      return Promise.resolve({
        json: () => Promise.resolve(posts)
      });
    }
    if (url.includes('/api/users')) {
      const users = [{ id: 1, name: "User1" }];
      return Promise.resolve({
        json: () => Promise.resolve(users)
      });
    }
    if (url.includes('/api/comments')) {
      const comments = [
        { id: 1, postId: 1, name: "Comment 1", body: "Nice post!", email: "a@example.com" },
        { id: 2, postId: 2, name: "Comment 2", body: "I disagree", email: "b@example.com" }
      ];
      return Promise.resolve({
        json: () => Promise.resolve(comments)
      });
    }
    return Promise.resolve({
      json: () => Promise.resolve([])
    });
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

test('renders posts, users, and comments', async () => {
  render(<Posts />);
  
  await waitFor(() => {
    expect(screen.getByText(/Post 1/i)).toBeInTheDocument();
  });
  
  expect(screen.getByText(/This is a sample post/i)).toBeInTheDocument();
  
  const userElements = screen.getAllByText(/User1/i);
  expect(userElements.length).toBeGreaterThan(0);
  
  expect(screen.getByText(/Comment 1/i)).toBeInTheDocument();
});

test('filters posts based on minLength and maxLength', async () => {
  render(<Posts />);
  
  await waitFor(() => {
    expect(screen.getByText(/Post 1/i)).toBeInTheDocument();
  });
  
  const minLengthInput = screen.getByLabelText(/Min Length/i);
  fireEvent.change(minLengthInput, { target: { value: '100' } });
  
  await waitFor(() => {
    expect(screen.getByText(/No posts available/i)).toBeInTheDocument();
  });

  fireEvent.change(minLengthInput, { target: { value: '0' } });
  const maxLengthInput = screen.getByLabelText(/Max Length/i);
  fireEvent.change(maxLengthInput, { target: { value: '10' } });

  await waitFor(() => {
    expect(screen.queryByText(/Post 1/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Post 2/i)).not.toBeInTheDocument();
  });
});

test('updates display limit when "Set Limit" button is clicked', async () => {
  render(<Posts />);
  
  await waitFor(() => {
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
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
        body: JSON.stringify({ limit: 5 })
      })
    );
  });
  
  await waitFor(() => {
    expect(screen.getByText(/Post 1/i)).toBeInTheDocument();
  });
});

test('handles empty data scenario', async () => {
  global.fetch = jest.fn((url) => {
    if (url.includes('/api/posts')) {
      return Promise.resolve({
        json: () => Promise.resolve([]),
      });
    } else if (url.includes('/api/users')) {
      return Promise.resolve({
        json: () => Promise.resolve([]),
      });
    } else if (url.includes('/api/comments')) {
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

  render(<Posts />);

  await waitFor(() => {
    expect(screen.getByText(/No posts available/i)).toBeInTheDocument();
  });
});
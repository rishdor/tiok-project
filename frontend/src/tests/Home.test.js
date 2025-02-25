import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Home from '../pages/Home';

test('renders Home component', () => {
  render(
    <Router>
      <Home />
    </Router>
  );

  expect(screen.getByText(/Welcome to JSONPlaceholder Consumer/i)).toBeInTheDocument();

  expect(screen.getByText(/Select a page to view:/i)).toBeInTheDocument();

  expect(screen.getByText(/Posts/i)).toBeInTheDocument();
  expect(screen.getByText(/Albums/i)).toBeInTheDocument();
  expect(screen.getByText(/Photos/i)).toBeInTheDocument();
});

test('renders navigation links', () => {
  render(
    <Router>
      <Home />
    </Router>
  );

  expect(screen.getByText(/Posts/i).closest('a')).toHaveAttribute('href', '/posts');
  expect(screen.getByText(/Albums/i).closest('a')).toHaveAttribute('href', '/albums');
  expect(screen.getByText(/Photos/i).closest('a')).toHaveAttribute('href', '/photos');
});
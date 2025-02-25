import { render, screen } from '@testing-library/react';
import App from './App';

test('renders home welcome message', () => {
  render(<App />);
  const welcomeElement = screen.getByText(/Welcome to JSONPlaceholder Consumer/i);
  expect(welcomeElement).toBeInTheDocument();
});

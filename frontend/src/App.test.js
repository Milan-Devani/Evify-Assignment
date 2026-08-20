import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Evify sign in screen when unauthenticated', () => {
  render(<App />);
  const titleElement = screen.getByText(/Sign in to Evify/i);
  expect(titleElement).toBeInTheDocument();
  const demoAccountBadge = screen.getByText(/Demo Account/i);
  expect(demoAccountBadge).toBeInTheDocument();
});

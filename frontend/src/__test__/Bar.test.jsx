import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Bar from '../components/Bar';

describe('Bar Component', () => {
  it('shows logout button when token exists', () => {
    render(
      <BrowserRouter>
        <Bar token={'mock-token'} setToken={() => {}} />
      </BrowserRouter>
    );
    expect(screen.getByText(/logout/i)).toBeInTheDocument();
  });

  it('shows login/signup when no token', () => {
    render(
      <BrowserRouter>
        <Bar token={null} setToken={() => {}} />
      </BrowserRouter>
    );
    expect(screen.getByLabelText(/login/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/signup/i)).toBeInTheDocument();
  });
});
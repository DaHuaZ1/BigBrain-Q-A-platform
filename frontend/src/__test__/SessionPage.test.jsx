import { render, screen } from '@testing-library/react';
import SessionPage from '../components/sessionPage';
import { BrowserRouter } from 'react-router-dom';

describe('SessionPage Component', () => {
  it('renders control panel UI', () => {
    render(
      <BrowserRouter>
        <SessionPage />
      </BrowserRouter>
    );
    expect(screen.getByText(/game session control/i)).toBeInTheDocument();
  });
});
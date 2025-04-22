import { render, screen, fireEvent } from '@testing-library/react';
import GameJoinPage from '../components/gameJoinPage';
import { BrowserRouter } from 'react-router-dom';

describe('GameJoinPage Component', () => {
  it('displays error if name and sessionId are empty', () => {
    render(
      <BrowserRouter>
        <GameJoinPage />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /start game/i }));
    expect(screen.getByText(/please enter your name and session id/i)).toBeInTheDocument();
  });
});
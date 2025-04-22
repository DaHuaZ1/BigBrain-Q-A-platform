import { render, screen } from '@testing-library/react';
import GameCard from '../components/gameCard';
import { BrowserRouter } from 'react-router-dom';

describe('GameCard Component', () => {
  test('renders game name', () => {
    const games = [
      {
        id: 1,
        name: 'Cool Game',
        owner: 'admin',
        active: null,
        oldSessions: [],
      },
    ];

    render(
      <BrowserRouter>
        <GameCard games={games} />
      </BrowserRouter>
    );

    expect(screen.getByText(/cool game/i)).toBeInTheDocument(); // ✅ updated to match test data
  });
});
import { render, screen } from '@testing-library/react';
import GameSnake from '../components/GameSnake';

// Mock canvas context
HTMLCanvasElement.prototype.getContext = () => ({
  fillRect: () => {},
  clearRect: () => {},
  fillText: () => {},
  drawImage: () => {},
  beginPath: () => {},
  moveTo: () => {},
  lineTo: () => {},
  stroke: () => {},
  closePath: () => {},
  arc: () => {},
  strokeRect: () => {},
});

describe('GameSnake Component', () => {
  it('renders snake canvas and score', () => {
    render(<GameSnake />);
    expect(screen.getByText(/snake game/i)).toBeInTheDocument();
    expect(screen.getByText(/score/i)).toBeInTheDocument();
  });
});
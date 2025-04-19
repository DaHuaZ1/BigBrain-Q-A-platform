import { useEffect, useRef, useState } from 'react';

const CANVAS_SIZE = 300;
const SCALE = 15;
const SPEED = 250;
const DIRECTIONS = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0]
};

const getRandomFood = () => {
  const max = CANVAS_SIZE / SCALE;
  return [
    Math.floor(Math.random() * max),
    Math.floor(Math.random() * max)
  ];
};

const GameSnake = () => {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState([[5, 5]]);
  const [dir, setDir] = useState([1, 0]);
  const [food, setFood] = useState(getRandomFood());
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  //Control movement
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setSnake(prev => {
        const head = [...prev[0]];
        head[0] += dir[0];
        head[1] += dir[1];

        //hit the wall
        if (
          head[0] < 0 || head[1] < 0 ||
          head[0] >= CANVAS_SIZE / SCALE || head[1] >= CANVAS_SIZE / SCALE
        ) {
          setGameOver(true);
          return prev;
        }

        //hit self
        if (prev.some(seg => seg[0] === head[0] && seg[1] === head[1])) {
          setGameOver(true);
          return prev;
        }

        const newSnake = [head, ...prev];

        //Eat food
        if (head[0] === food[0] && head[1] === food[1]) {
          setScore(s => s + 1);
          setFood(getRandomFood());
          return newSnake;
        }

        newSnake.pop();
        return newSnake;
      });
    }, SPEED);

    return () => clearInterval(interval);
  }, [dir, food, gameOver]);

  //Controls keyboard direction
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (DIRECTIONS[e.key]) {
        setDir(DIRECTIONS[e.key]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  //rendering canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    //snake
    ctx.fillStyle = 'black';
    snake.forEach(([x, y]) => {
      ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
    });

    //food
    ctx.fillStyle = 'green';
    ctx.fillRect(food[0] * SCALE, food[1] * SCALE, SCALE, SCALE);
  }, [snake, food]);

  return (
    <div style={{ textAlign: 'center' }}>
      <h3>🐍 Snake Game</h3>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        style={{ border: '2px solid #333' }}
      />
      <p>Score: {score}</p>
      {gameOver && <p style={{ color: 'red' }}>Game Over! Click Stop and then Try to replay the game.</p>}
    </div>
  );
};

export default GameSnake;

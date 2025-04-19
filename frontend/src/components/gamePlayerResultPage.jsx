import { useParams } from 'react-router-dom';

const GamePlayerResultPage = () => {
  const { sessionId, playerId } = useParams();
  return (
    <div>
        GamePlayerResultPage
      <div>Session ID: {sessionId}</div>
      <div>Player ID: {playerId}</div>
    </div>
  )
}
export default GamePlayerResultPage;
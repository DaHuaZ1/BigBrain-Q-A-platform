import {useEffect, useState} from "react";
import { useParams } from "react-router-dom";
import { MutateGameSession,FetchGameStatus } from "../sessionAPI";
import { Button } from "antd";

const SessionPage = () => {
  const {game_id, session_id} = useParams();
  const [sessionData, setSessionData] = useState(null);

  const fetchStatus = async () => {
    try {
      const result = await FetchGameStatus(session_id);
      if (result.results) {
        setSessionData(result.results);
      } else {
        console.error("No session data found");
      }
    } catch (error) {
      console.error("Error fetching session status:", error);
    }
  }

  useEffect(() => {
    fetchStatus();
  }, []);

  const mutate = (type) => {
    if (!sessionData?.active) {
      console.error("No active session, cannot mutate.");
      return;
    }
  
    MutateGameSession(game_id, type).then((res) => {
      if (res.data?.status) {
        fetchStatus(); // 刷新状态
      } else {
        console.error("Failed to mutate session:", res);
      }
    }).catch((error) => {
      console.error("Error mutating session:", error);
    });
  };
  

  if (!sessionData) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <p>current position: {sessionData.position}</p>
      <p>current active: {sessionData.active.toString()}</p>
      <Button type="primary" onClick={() => mutate("ADVANCE")}>Next Question</Button>
      <Button danger onClick={() => mutate("END")}>Stop Game</Button>
    </div>
  );
}

export default SessionPage;
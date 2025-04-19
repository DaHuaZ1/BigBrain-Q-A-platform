import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MutateGameSession, FetchGameStatus } from "../sessionAPI";
import { Button, Card, Typography, Space, Divider, message } from "antd";
import { ArrowLeftOutlined, StopOutlined, StepForwardOutlined } from "@ant-design/icons";

const SessionPage = () => {
  const { game_id, session_id } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const navigate = useNavigate();

  const fetchStatus = async () => {
    try {
      const result = await FetchGameStatus(session_id);
      if (result.results) {
        setSessionData(result.results);
      } else {
        message.error("No session data found");
      }
    } catch (error) {
      console.error("Error fetching session status:", error);
      message.error("Failed to fetch session status");
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const mutate = async (type) => {
    if (!sessionData?.active) {
      message.warning("No active session, cannot mutate.");
      return;
    }
    try {
      const res = await MutateGameSession(game_id, type);
      if (res.data?.status) {
        fetchStatus();
        message.success(`${type} successful!`);
      } else {
        message.error("Mutation failed");
      }
    } catch (err) {
      message.error("Error mutating session");
      console.error(err);
    }
  };

  if (!sessionData) {
    return <div style={{ padding: 40, textAlign: "center" }}>Loading session data...</div>;
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <Card title="Game Session Control" variant={false} style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <Typography.Paragraph><strong>Session ID:</strong> {session_id}</Typography.Paragraph>
        <Typography.Paragraph><strong>Current Position:</strong> {sessionData.position}</Typography.Paragraph>
        <Typography.Paragraph><strong>Status:</strong> {sessionData.active ? "Active" : "Ended"}</Typography.Paragraph>

        <Divider />

        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Button
            type="primary"
            icon={<StepForwardOutlined />}
            block
            onClick={() => mutate("ADVANCE")}
            disabled={!sessionData.active}
          >
            {sessionData.position === -1 ? "Start Game" : "Next Question"}
          </Button>

          <Button
            danger
            icon={<StopOutlined />}
            block
            onClick={() => mutate("END")}
            disabled={!sessionData.active}
          >
            Stop Game
          </Button>

          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            block
          >
            Back to Dashboard
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default SessionPage;

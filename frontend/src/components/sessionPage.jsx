import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MutateGameSession,
  FetchGameStatus,
  FetchGameResults,
} from "../sessionAPI";
import {
  Button,
  Card,
  Typography,
  Space,
  Divider,
  message,
  Modal,
  Table,
} from "antd";
import {
  ArrowLeftOutlined,
  StopOutlined,
  StepForwardOutlined,
} from "@ant-design/icons";
import { BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, ResponsiveContainer } from "recharts";

const SessionPage = () => {
  const { game_id, session_id } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [resultsData, setResultsData] = useState([]);
  const [showResultsPrompt, setShowResultsPrompt] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [canViewResultsLater, setCanViewResultsLater] = useState(false);
  const navigate = useNavigate();

  const fetchStatus = async () => {
    try {
      const result = await FetchGameStatus(session_id);
      if (result.results) {
        setSessionData(result.results);
        if (!result.results.active) {
          setShowResultsPrompt(true);
        }
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

  const fetchResults = async () => {
    try {
      const res = await FetchGameResults(session_id);
      if (Array.isArray(res.results)) {
        setResultsData(res.results);
        setShowResultsModal(true);
        setShowResultsPrompt(false); 
      }
    } catch (err) {
      console.error("Error fetching results", err);
    }
  };

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

  const calculateUserScores = () => {
    return resultsData.map((user) => {
      let total = 0;
      user.answers.forEach((a, index) => {
        if (a.correct) {
          const points = sessionData.questions[index]?.points ?? 0;
          total += points;
        }
      });
      return { name: user.name, score: total };
    })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  };

  const calculateCorrectPercentagePerQuestion = () => {
    const totalUsers = resultsData.length;
    const questionCount = resultsData[0]?.answers?.length || 0;
    return Array.from({ length: questionCount }).map((_, i) => {
      const correctCount = resultsData.filter((user) => user.answers[i]?.correct).length;
      return {
        question: `Q${i + 1}`,
        correct: ((correctCount / totalUsers) * 100).toFixed(1),
      };
    });
  };

  const calculateAvgResponseTime = () => {
    const questionCount = resultsData[0]?.answers?.length || 0;
    return Array.from({ length: questionCount }).map((_, i) => {
      const times = resultsData
        .map((user) => {
          const a = user.answers[i];
          if (!a) return 0;
          const start = new Date(a.questionStartedAt);
          const end = new Date(a.answeredAt);
          return (end - start) / 1000;
        })
        .filter((t) => !isNaN(t));
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      return {
        question: `Q${i + 1}`,
        avgTime: avg?.toFixed(2) || 0,
      };
    });
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <Card title="Game Session Control" variant={false} style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <Typography.Paragraph><strong>Session ID:</strong> {session_id}</Typography.Paragraph>
        <Typography.Paragraph><strong>Current Position:</strong> {sessionData?.position}</Typography.Paragraph>
        <Typography.Paragraph><strong>Status:</strong> {sessionData?.active ? "Active" : "Ended"}</Typography.Paragraph>

        <Divider />

        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Button
            type="primary"
            icon={<StepForwardOutlined />}
            block
            onClick={() => mutate("ADVANCE")}
            disabled={!sessionData?.active}
          >
            {sessionData?.position === -1 ? "Start Game" : "Next Question"}
          </Button>

          <Button
            danger
            icon={<StopOutlined />}
            block
            onClick={() => mutate("END")}
            disabled={!sessionData?.active}
          >
            Stop Game
          </Button>

          {!sessionData?.active && (
            <Button
              type="default"
              block
              onClick={fetchResults}
            >
              View Results
            </Button>
          )}

          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/dashboard")}
            block
          >
            Back to Dashboard
          </Button>
        </Space>
      </Card>

      <Modal
        open={showResultsPrompt}
        onOk={fetchResults}
        onCancel={() => {
          setShowResultsPrompt(false);
          setCanViewResultsLater(true);
        }}
        closable={false}
        okText="Sure"
        cancelText="Maybe later"
        title="The game has ended. Would you like to view the results?"
      />

      <Modal
        open={showResultsModal}
        footer={null}
        closable={false}
        width={900}
      >
        <Typography.Title level={4}>Top 5 Users</Typography.Title>
        <Table
          dataSource={calculateUserScores()}
          columns={[{ title: "Name", dataIndex: "name" }, { title: "Score", dataIndex: "score" }]}
          pagination={false}
          rowKey="name"
        />

        <Divider />

        <Typography.Title level={5}>Correct Answer Rate per Question (%)</Typography.Title>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={calculateCorrectPercentagePerQuestion()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="question" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="correct" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>

        <Divider />

        <Typography.Title level={5}>Average Response Time per Question (s)</Typography.Title>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={calculateAvgResponseTime()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="question" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="avgTime" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>

        <div style={{ textAlign: "right", marginTop: 16 }}>
          <Button onClick={() => setShowResultsModal(false)}>Close</Button>
        </div>
      </Modal>
    </div>
  );
};

export default SessionPage;

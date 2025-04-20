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
  Divider,
  message,
  Modal,
  Table,
  Tooltip,
} from "antd";
import {
  HomeOutlined,
  PoweroffOutlined,
  PlayCircleOutlined,
  AreaChartOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  LineChart,
  Line,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const SessionPage = () => {
  const { game_id, session_id } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [resultsData, setResultsData] = useState([]);
  const [showResultsPrompt, setShowResultsPrompt] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [canViewResultsLater, setCanViewResultsLater] = useState(false);
  const [loadingAdvance, setLoadingAdvance] = useState(false);
  const [loadingEnd, setLoadingEnd] = useState(false);
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
      if (type === "ADVANCE") setLoadingAdvance(true);
      if (type === "END") setLoadingEnd(true);
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
    } finally {
      setLoadingAdvance(false);
      setLoadingEnd(false);
    }
  };

  const calculateUserScores = () => {
    return resultsData
      .map((user) => {
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
      .slice(0, 5)
      .map((user, i) => ({ ...user, rank: i + 1 }));
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
    <div style={{ maxWidth: "95%", margin: "40px auto", padding: 20 }}>
      <Card
        title="Game Session Control"
        hoverable
        style={{ borderRadius: 16, boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)" }}
      >
        <Typography.Paragraph><strong>Session ID:</strong> {session_id}</Typography.Paragraph>
        <Typography.Paragraph><strong>Current Position:</strong> {sessionData?.position}</Typography.Paragraph>
        <Typography.Paragraph><strong>Status:</strong> {sessionData?.active ? "Active" : "Ended"}</Typography.Paragraph>

        <Divider dashed />

        <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 16 }}>
          <Tooltip title="Start or advance the game">
            <Button
              type="primary"
              shape="circle"
              icon={<PlayCircleOutlined style={{ color: '#52c41a' }} />}
              size="large"
              loading={loadingAdvance}
              onClick={() => mutate("ADVANCE")}
              disabled={!sessionData?.active}
              style={!sessionData?.active ? { backgroundColor: '#E2E2E2', borderColor: '#DADADA', color: '#d9d9d9' } : {}}
            />
          </Tooltip>

          <Tooltip title="Stop the game">
            <Button
              danger
              shape="circle"
              icon={<PoweroffOutlined style={{ color: '#ff4d4f' }} />}
              size="large"
              loading={loadingEnd}
              onClick={() => mutate("END")}
              disabled={!sessionData?.active}
              style={!sessionData?.active ? { backgroundColor: '#E2E2E2', borderColor: '#DADADA', color: '#d9d9d9' } : {}}
            />
          </Tooltip>

          {!sessionData?.active && (
            <Tooltip title="View session results">
              <Button
                type="default"
                shape="circle"
                icon={<AreaChartOutlined style={{ color: '#1890ff' }} />}
                size="large"
                onClick={fetchResults}
              />
            </Tooltip>
          )}

          <Tooltip title="Back to dashboard">
            <Button
              shape="circle"
              icon={<HomeOutlined style={{ color: '#8c8c8c' }} />}
              size="large"
              onClick={() => navigate("/dashboard")}
            />
          </Tooltip>
        </div>
      </Card>

      <Modal
        open={showResultsPrompt}
        onOk={fetchResults}
        onCancel={() => {
          setShowResultsPrompt(false);
          setCanViewResultsLater(true);
        }}
        closable={false}
        centered
        title={
          <>
            <ExclamationCircleOutlined style={{ color: "#faad14", marginRight: 8 }} />
            The game has ended. Would you like to view the results?
          </>
        }
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Button key="cancel" color="danger" variant="solid" onClick={() => {
              setShowResultsPrompt(false);
              setCanViewResultsLater(true);
            }}>
              Maybe later
            </Button>
            <Button key="ok" color="cyan" variant="solid" onClick={fetchResults}>
              Sure
            </Button>
          </div>
        }
      />

      <Modal
        open={showResultsModal}
        footer={null}
        closable={false}
        width={900}
        style={{ borderRadius: 12, padding: 16 }}
      >
        <Typography.Title level={4}>Top 5 Users</Typography.Title>
        <Table
          dataSource={calculateUserScores()}
          columns={[
            { title: "#", render: (_, __, index) => index + 1 },
            { title: "Name", dataIndex: "name" },
            { title: "Score", dataIndex: "score" },
          ]}
          pagination={false}
          rowKey="name"
        />

        <Divider dashed style={{ marginTop: 24, marginBottom: 24 }} />

        <Typography.Title level={5}>Correct Answer Rate per Question (%)</Typography.Title>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={calculateCorrectPercentagePerQuestion()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="question" />
            <YAxis />
            <ReTooltip />
            <Bar dataKey="correct" fill="#7A77FF" />
          </BarChart>
        </ResponsiveContainer>

        <Divider dashed style={{ marginTop: 24, marginBottom: 24 }} />

        <Typography.Title level={5}>Average Response Time per Question (s)</Typography.Title>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={calculateAvgResponseTime()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="question" />
            <YAxis />
            <ReTooltip />
            <Line type="monotone" dataKey="avgTime" stroke="#FFB140" />
          </LineChart>
        </ResponsiveContainer>

        <div style={{ textAlign: "right", marginTop: 16 }}>
          <Button color="danger" variant="filled" onClick={() => setShowResultsModal(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default SessionPage;

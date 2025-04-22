// Import necessary React hooks and router utilities
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Import session-related API functions
import {
  MutateGameSession,
  FetchGameStatus,
  FetchGameResults,
} from "../sessionAPI";

// Import Ant Design components and icons for UI
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

// Import chart components from Recharts
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
  // Get session and game IDs from URL
  const { game_id, session_id } = useParams();

  // State variables for session and result data
  const [sessionData, setSessionData] = useState(null);
  const [resultsData, setResultsData] = useState([]);

  // Modal control states
  const [showResultsPrompt, setShowResultsPrompt] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);

  // Loading states for game control buttons
  const [loadingAdvance, setLoadingAdvance] = useState(false);
  const [loadingEnd, setLoadingEnd] = useState(false);

  const navigate = useNavigate();

  // Fetch current session status and check if session is active
  const fetchStatus = async () => {
    try {
      const result = await FetchGameStatus(session_id);
      if (result.results) {
        setSessionData(result.results);
        if (!result.results.active) {
          setShowResultsPrompt(true); // Prompt if session already ended
        }
      } else {
        message.error("No session data found");
      }
    } catch (error) {
      message.error("Failed to fetch session status", error);
    }
  };

  // Initial session status fetch on page load
  useEffect(() => {
    fetchStatus();
  }, []);

  // Fetch full game results
  const fetchResults = async () => {
    try {
      const res = await FetchGameResults(session_id);
      if (Array.isArray(res.results)) {
        setResultsData(res.results);
        setShowResultsModal(true); // Show results modal
        setShowResultsPrompt(false); // Hide prompt
      }
    } catch (_) {
      // Silently ignore errors
    }
  };

  // Trigger session mutations (advance or end game)
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
        fetchStatus(); // Refresh session state
        message.success(`${type} successful!`);
      } else {
        message.error("Mutation failed");
      }
    } catch (err) {
      message.error("Error mutating session", err);
    } finally {
      setLoadingAdvance(false);
      setLoadingEnd(false);
    }
  };

  // Generate scores for top users based on remaining time
  const calculateUserScores = () => {
    return resultsData
      .map((user) => {
        let total = 0;
        let correctCount = 0;
        user.answers.forEach((a, index) => {
          if (a.correct) {
            const points = sessionData.questions[index]?.points ?? 0;
            const duration = sessionData.questions[index]?.duration ?? 0;
            const start = new Date(a.questionStartedAt);
            const end = new Date(a.answeredAt);
            const timeTaken = (end - start) / 1000;
            const remainingTime = Math.max(0, duration - timeTaken);
            const score = points * (remainingTime / 60);
            total += parseFloat(score.toFixed(1));
            correctCount++;
          }
        });
        const badge = correctCount === user.answers.length ? "💯" : 
          correctCount >= user.answers.length * 0.8 ? "🎯" : 
            correctCount <= 1 ? "😴" : "";
        return { name: user.name, score: total, badge };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((user, i) => ({ ...user, rank: i + 1 }));
  };

  // Compute percentage of correct answers per question
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

  // Compute average response time per question
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

  // Compute accuracy ranking for each user
  const calculateAccuracyRanking = () => {
    return resultsData.map((user) => {
      const total = user.answers.length;
      const correct = user.answers.filter((a) => a.correct).length;
      return {
        name: user.name,
        accuracy: ((correct / total) * 100).toFixed(1) + "%",
      };
    }).sort((a, b) => parseFloat(b.accuracy) - parseFloat(a.accuracy));
  };

  // Find fastest user per question
  const calculateFastestUsersPerQuestion = () => {
    const questionCount = resultsData[0]?.answers?.length || 0;
    return Array.from({ length: questionCount }).map((_, i) => {
      let fastest = null;
      let minTime = Infinity;
      resultsData.forEach((user) => {
        const a = user.answers[i];
        if (a) {
          const start = new Date(a.questionStartedAt);
          const end = new Date(a.answeredAt);
          const time = (end - start) / 1000;
          if (time < minTime) {
            minTime = time;
            fastest = user.name;
          }
        }
      });
      return {
        question: `Q${i + 1}`,
        fastestUser: fastest,
        time: minTime.toFixed(2) + "s",
      };
    });
  };

  // Export top 5 users as CSV file
  const downloadCSV = () => {
    const top5 = calculateUserScores();
    const csv = [
      ["Rank", "Name", "Score", "Badge"],
      ...top5.map(u => [u.rank, u.name, u.score, u.badge])
    ]
      .map(row => row.join(","))
      .join("\n");
  
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `session_${session_id}_ranking.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Return JSX layout for Session Page UI
  return (
    <div style={{ maxWidth: "95%", margin: "40px auto", padding: 20 }}>
      {/* Session Control Panel */}
      <Card
        title="Game Session Control"
        hoverable
        style={{ borderRadius: 16, boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)" }}
      >
        {/* Session metadata */}
        <Typography.Paragraph><strong>Session ID:</strong> {session_id}</Typography.Paragraph>
        <Typography.Paragraph><strong>Current Position:</strong> {sessionData?.position}</Typography.Paragraph>
        <Typography.Paragraph><strong>Status:</strong> {sessionData?.active ? "Active" : "Ended"}</Typography.Paragraph>

        <Divider dashed />

        {/* Session action buttons: advance, end, view results, back */}
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

      {/* Modal prompting user to view results */}
      <Modal
        open={showResultsPrompt}
        onOk={fetchResults}
        onCancel={() => {
          setShowResultsPrompt(false);
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
            }}>
              Maybe later
            </Button>
            <Button key="ok" color="cyan" variant="solid" onClick={fetchResults}>
              Sure
            </Button>
          </div>
        }
      />

      {/* Modal displaying full session results */}
      <Modal
        open={showResultsModal}
        footer={null}
        closable={false}
        width={900}
        style={{ borderRadius: 12, padding: 16 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <Typography.Title level={4}>Top 5 Users</Typography.Title>
          <Button onClick={downloadCSV}>Download CSV</Button>
        </div>

        {/* Score calculation notes */}
        <div style={{
          backgroundColor: '#fef5e1',
          border: '1px solid rgb(242, 217, 136)',
          padding: '8px 16px',
          borderRadius: 8,
          marginBottom: 16,
        }}>
          <Typography.Text style={{display:"block"}} type="warning">
            ⚠️ Scores are calculated as: <strong>Question Points x Speed</strong> (speed = Remaining Time (The less time spent, the higher the score)).
          </Typography.Text>
          <Typography.Text type="warning">
            ⚠️ Player may get a score lower than the question points if question time is shorter than 1 minute.
          </Typography.Text>
        </div>

        {/* User rankings */}
        <Table
          dataSource={calculateUserScores()}
          columns={[
            { title: "#", render: (_, __, index) => index + 1 },
            { title: "Name", dataIndex: "name" },
            { title: "Score", dataIndex: "score" },
            { title: "Badge", dataIndex: "badge" },
          ]}
          pagination={false}
          rowKey="name"
        />

        <Divider dashed style={{ marginTop: 24, marginBottom: 24 }} />

        {/* Correct rate bar chart */}
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

        {/* Avg response time line chart */}
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

        <Divider dashed style={{ marginTop: 24, marginBottom: 24 }} />

        {/* Accuracy table */}
        <Typography.Title level={5}>Top Accuracy Rankings</Typography.Title>
        <Table
          dataSource={calculateAccuracyRanking()}
          columns={[
            { title: "Name", dataIndex: "name" },
            { title: "Accuracy", dataIndex: "accuracy" },
          ]}
          pagination={false}
          rowKey="name"
        />

        <Divider dashed style={{ marginTop: 24, marginBottom: 24 }} />

        {/* Fastest responders table */}
        <Typography.Title level={5}>Fastest Responders Per Question</Typography.Title>
        <Table
          dataSource={calculateFastestUsersPerQuestion()}
          columns={[
            { title: "Question", dataIndex: "question" },
            { title: "User", dataIndex: "fastestUser" },
            { title: "Time", dataIndex: "time" },
          ]}
          pagination={false}
          rowKey="question"
        />

        {/* Close button */}
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

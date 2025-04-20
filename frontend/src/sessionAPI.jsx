import AUTH from "./Constant";

const userToken = () => localStorage.getItem(AUTH.Token_key);

const handleResponse = async (res) => {
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.error || "Unknown error");
  }
  return res.json();
};

export const MutateGameSession = (gameId, mutationType) => {
  return fetch(`http://localhost:5005/admin/game/${gameId}/mutate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken()}`
    },
    body: JSON.stringify({ mutationType })
  }).then(handleResponse);
};

export const FetchGameStatus = (sessionId) => {
  return fetch(`http://localhost:5005/admin/session/${sessionId}/status`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken()}`
    }
  }).then(handleResponse);
};

export const FetchGameResults = (sessionId) => {
  return fetch(`http://localhost:5005/admin/session/${sessionId}/results`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken()}`,
    },
  }).then(handleResponse);
};


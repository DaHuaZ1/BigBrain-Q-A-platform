// Import constants used for accessing localStorage keys
import AUTH from "./Constant";

// Helper function to retrieve token from localStorage
const userToken = () => localStorage.getItem(AUTH.Token_key);

// Common response handler for all fetch requests
const handleResponse = async (res) => {
  // If response status is not OK (status code 200-299), throw an error
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.error || "Unknown error");
  }
  // Return parsed JSON data if response is successful
  return res.json();
};

// Sends a POST request to mutate a game session (e.g., start or advance game)
export const MutateGameSession = (gameId, mutationType) => {
  return fetch(`http://localhost:5005/admin/game/${gameId}/mutate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Inform server of JSON payload
      Authorization: `Bearer ${userToken()}`, // Attach user token
    },
    body: JSON.stringify({ mutationType }) // Payload includes mutation type (e.g., "advance", "end")
  }).then(handleResponse); // Use shared response handler
};

// Fetch the current status of a game session (e.g., active, waiting)
export const FetchGameStatus = (sessionId) => {
  return fetch(`http://localhost:5005/admin/session/${sessionId}/status`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken()}`, // Attach token for authentication
    }
  }).then(handleResponse); // Handle and return response data
};

// Fetch results for a completed game session
export const FetchGameResults = (sessionId) => {
  return fetch(`http://localhost:5005/admin/session/${sessionId}/results`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken()}`, // Auth required for result access
    },
  }).then(handleResponse); // Parse and return the JSON results
};

// Import constant keys for localStorage token access
import AUTH from "./Constant";
// Import backend URL for API requests
import backendURL from "./backendURL"; // Import backend URL

// Handle errors returned from the backend response
const handleError = (res) => {
  const { error } = res;
  if (error) {
    // Throw an error to be caught by the caller if the response contains an error
    throw new Error(error);
  }
  return res; // Return the valid response
};

// Function to overwrite all games on the server with a new games array
export const putNewGame = (games) => {
  // Retrieve the user token from localStorage
  const userToken = localStorage.getItem(AUTH.Token_key);

  // Send PUT request to update the full list of games
  return fetch(`${backendURL}/admin/games`, {
    method: "PUT", // HTTP method for replacing existing data
    headers: {
      "Content-Type": "application/json; charset=UTF-8", // Specify JSON payload
      Authorization: `Bearer ${userToken}`, // Include token in Authorization header for authentication
    },
    body: JSON.stringify({ games: games }), // Convert games array to JSON string
  })
    .then((res) => res.json()) // Parse response as JSON
    .then(handleError); // Handle potential errors in the response
};

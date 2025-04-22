// Import AUTH constants (e.g., token key)
import AUTH from "./Constant";

// Handle API response errors
const handleError = (res) => {
  const { error } = res;
  if (error) {
    // If API response contains an `error`, throw it as a JavaScript Error
    throw new Error(error);
  }
  return res; // Otherwise, return the response as is
};

// Fetch all games created by the current admin user
export const fetchAllGames = () => {
  // Retrieve the token from localStorage
  const userToken = localStorage.getItem(AUTH.Token_key);

  // Make a GET request to the admin games endpoint
  return fetch("http://localhost:5005/admin/games", {
    method: "GET",
    headers: {
      "Content-Type": "application/json; charset=UTF-8", // Inform server we're sending JSON
      Authorization: `Bearer ${userToken}`, // Include token in Authorization header
    },
  })
    .then((res) => res.json()) // Parse the JSON response
    .then(handleError); // Handle errors if present
};

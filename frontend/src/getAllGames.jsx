import AUTH from "./Constant";

const handleError = (res) => {
  const {error} = res;
  if (error) {
    throw new Error(error);
  }
  return res;
}

export const fetchAllGames = () => {
  const userToken = localStorage.getItem(AUTH.Token_key);

  return fetch("http://localhost:5005/admin/games", {
    method: "GET",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${userToken}`,
    },
  })
    .then((res) => res.json())
    .then(handleError)
};

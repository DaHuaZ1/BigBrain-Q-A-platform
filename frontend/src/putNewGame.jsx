import AUTH from "./Constant";

const handleError = (res) => {
    const {error} = res;
    if (error) {
        throw new Error(error);
    }
    return res;
}

export const putNewGame = (games) => {
    const userToken = localStorage.getItem(AUTH.Token_key);

    return fetch("http://localhost:5005/admin/games", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
            Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({games: games}),
    })
        .then((res) => res.json())
        .then(handleError)
};
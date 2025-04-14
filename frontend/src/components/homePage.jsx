const Home = (props) => {
  return (
    <>
      {props.token ===null
        ?<>What are you waiting for? Hurry up and join us!</>
        :<>Welcome back, ready to start a new game?</>}
    </>
  )
}

export default Home;

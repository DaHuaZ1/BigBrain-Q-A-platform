import Login from './components/loginPage';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Signup from './components/registerPage';
import Bar from './components/Bar';
import { useState } from 'react';
import Home from './components/homePage';
import Dashboard from './components/Dashboard';
import SingleGame from './components/singleGame';

function App() {
  const[token, setToken]=useState(localStorage.getItem('token'));
  return (
    // Route Jump Related Code
    <BrowserRouter>
      <Bar token={token} setToken={setToken} />
      <Routes>
        <Route path="/" element={<Home token={token}/>} />
        <Route path="/login" element={<Login setToken={setToken}/>} />
        <Route path="/signup" element={<Signup setToken={setToken}/>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/game/:game_id" element={<SingleGame />} />
      </Routes>

    </BrowserRouter>
  )
}

export default App

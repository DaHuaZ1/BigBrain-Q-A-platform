import Login from './components/loginPage';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Signup from './components/registerPage';
import Bar from './components/Bar';
import { useState } from 'react';
function App() {
  const[token, setToken]=useState(localStorage.getItem('token'));
  return (
    // Route Jump Related Code
    <BrowserRouter>
      <Bar token={token} setToken={setToken} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>

    </BrowserRouter>
  )
}

export default App

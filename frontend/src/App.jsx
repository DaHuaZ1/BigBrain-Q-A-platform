import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import Login from './components/login';
import{Routes, Route, BrowserRouter} from 'react-router-dom';
function App() {
  const [count, setCount] = useState(0);
  
  return (
    // Route Jump Related Code
    <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login/>} />
    </Routes>

    </BrowserRouter>
  )
}

export default App

// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Esta ruta espera la región y el nombre en la URL */}
        <Route path="/profile/:region/:summonerName" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
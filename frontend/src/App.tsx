import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Layout from './components/layout.tsx'
import Scan from './pages/scan.tsx'
import Interns from './pages/interns.tsx'
import History from './pages/history.tsx'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Redirect / to /scan */}
          <Route index element={<Navigate to="scan" replace />} />

          <Route path="/scan" element={<Scan />} />
          <Route path="/interns" element={<Interns />} />
          <Route path="/history" element={<History />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

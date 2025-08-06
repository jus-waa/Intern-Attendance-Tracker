//import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './components/layout.tsx'
import Scan from './pages/scan.tsx'
import Interns from './pages/interns.tsx'


/*
<Route path="services" element={<ServicesPage />} />
<Route path="contact" element={<ContactPage />} />
*/

function App() {


  return (
      <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Scan />} />
          <Route path="interns" element={<Interns />} />
          
        </Route>
      </Routes>
    </Router>
  )
}

export default App

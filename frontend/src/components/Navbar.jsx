import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    navigate('/')
  }

  if (!token) return null

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <div className="container-fluid">
        <span className="navbar-brand">Fatura Uygulaması</span>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link to="/upload" className="nav-link">Fatura Yükle</Link>
            </li>
            <li className="nav-item">
              <Link to="/invoices" className="nav-link">Faturalarım</Link>
            </li>
          </ul>
          <button onClick={handleLogout} className="btn btn-outline-light btn-sm">
            Çıkış Yap
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

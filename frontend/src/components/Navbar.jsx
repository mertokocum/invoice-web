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
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="space-x-4">
        <Link to="/upload" className="hover:underline">Fatura Yükle</Link>
        <Link to="/invoices" className="hover:underline">Faturalarım</Link>
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
      >
        Çıkış Yap
      </button>
    </nav>
  )
}

export default Navbar

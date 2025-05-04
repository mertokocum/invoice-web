import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function InvoiceList() {
  const [invoices, setInvoices] = useState([])
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get('http://localhost:3000/api/invoices', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setInvoices(res.data)
      } catch (err) {
        setError('Faturalar alınamadı')
      }
    }

    fetchInvoices()
  }, [])

  const handleClick = (id) => {
    navigate(`/invoice/${id}`)
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Yüklenen Faturalar</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="list-group">
        {invoices.map((inv) => (
          <button
            key={inv.id}
            className="list-group-item list-group-item-action"
            onClick={() => handleClick(inv.id)}
          >
            <div className="d-flex justify-content-between">
              <span>📄 {inv.filename}</span>
              <small className="text-muted">{new Date(inv.createdAt).toLocaleString()}</small>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default InvoiceList

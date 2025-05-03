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
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Yüklenen Faturalar</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <ul className="space-y-2">
        {invoices.map((inv) => (
          <li
            key={inv.id}
            onClick={() => handleClick(inv.id)}
            className="p-4 bg-white shadow rounded cursor-pointer hover:bg-gray-50 border"
          >
            <div className="font-medium">📄 {inv.filename}</div>
            <div className="text-sm text-gray-500">
              Tarih: {new Date(inv.createdAt).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default InvoiceList

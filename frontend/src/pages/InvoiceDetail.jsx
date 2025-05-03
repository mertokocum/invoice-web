import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

function InvoiceDetail() {
  const { id } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`http://localhost:3000/api/invoices/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setInvoice(res.data)
      } catch (err) {
        setError('Fatura verisi alınamadı')
      }
    }

    fetchInvoice()
  }, [id])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Fatura Detayı</h1>
      {error && <p className="text-red-500">{error}</p>}
      {!invoice ? (
        <p>Yükleniyor...</p>
      ) : (
        <>
          <div className="bg-white p-4 rounded shadow border mb-4">
            <p><strong>Dosya:</strong> {invoice.filename}</p>
            <p><strong>Tarih:</strong> {new Date(invoice.createdAt).toLocaleString()}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded shadow">
            <h2 className="text-lg font-medium mb-2">JSON Verisi</h2>
            <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(invoice.parsedData, null, 2)}
            </pre>
          </div>
        </>
      )}
    </div>
  )
}

export default InvoiceDetail

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
    <div className="container mt-5">
      <h2 className="mb-4">Fatura Detayı</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {!invoice ? (
        <div className="text-center">Yükleniyor...</div>
      ) : (
        <>
          <div className="card mb-4">
            <div className="card-body">
              <p><strong>Dosya Adı:</strong> {invoice.filename}</p>
              <p><strong>Yükleme Tarihi:</strong> {new Date(invoice.createdAt).toLocaleString()}</p>
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <strong>JSON Verisi</strong>
            </div>
            <div className="card-body">
              <pre className="bg-light p-3 rounded overflow-auto" style={{ maxHeight: '500px' }}>
                {JSON.stringify(invoice.parsedData, null, 2)}
              </pre>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default InvoiceDetail

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

function InvoiceDetail() {
  const { id } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [error, setError] = useState(null)
  const [showImage, setShowImage] = useState(false)

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`http://localhost:3000/api/invoices/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setInvoice(res.data)
      } catch (err) {
        setError('Failed to load invoice data')
      }
    }

    fetchInvoice()
  }, [id])

  const handleToggleImage = () => setShowImage(!showImage)

  const data = invoice?.parsedData || {}

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Invoice Detail</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      {invoice && (
        <>
          {invoice.imagePath && (
            <div className="card mb-3" style={{ cursor: 'pointer' }}>
              <div
                className="card-header d-flex justify-content-between align-items-center"
                onClick={handleToggleImage}
              >
                <span>Uploaded Image</span>
                <span style={{ fontSize: '20px' }}>
                  {showImage ? '▲' : '▼'}
                </span>
              </div>
              {showImage && (
                <div className="card-body text-center">
                  <img
                    src={`http://localhost:3000/${invoice.imagePath.replace(/\\/g, '/')}`}
                    alt="Invoice"
                    className="img-fluid"
                    style={{ maxHeight: '400px' }}
                  />
                </div>
              )}
            </div>
          )}

          <div className="card mb-3">
            <div className="card-body">
              <p><strong>Filename:</strong> {invoice.filename}</p>
              <p><strong>Upload Time:</strong> {new Date(invoice.createdAt).toLocaleString()}</p>
            </div>
          </div>

          {/* Store Info */}
          <div className="card mb-3">
            <div className="card-header">Store Info</div>
            <div className="card-body p-0">
              <table className="table table-bordered mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Address</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Invoice No</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{data.storeInfo?.name || '-'}</td>
                    <td>{data.storeInfo?.address || '-'}</td>
                    <td>{data.storeInfo?.storePhone || '-'}</td>
                    <td>{data.storeInfo?.email || '-'}</td>
                    <td>{data.storeInfo?.invoiceNumber || '-'}</td>
                    <td>{data.storeInfo?.date || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Customer Info */}
          <div className="card mb-3">
            <div className="card-header">Customer Info</div>
            <div className="card-body p-0">
              <table className="table table-bordered mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Tax Number</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{data.customerInfo?.fullName || '-'}</td>
                    <td>{data.customerInfo?.email || '-'}</td>
                    <td>{data.customerInfo?.phone || '-'}</td>
                    <td>{data.customerInfo?.taxNumber || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Items */}
          <div className="card mb-3">
            <div className="card-header">Items</div>
            <div className="card-body p-0">
              <table className="table table-striped mb-0">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.productName}</td>
                      <td>{item.quantity}</td>
                      <td>{item.unitPrice}</td>
                      <td>{item.lineTotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Details */}
          <div className="card mb-3">
            <div className="card-header">Payment Details</div>
            <div className="card-body p-0">
              <table className="table table-bordered mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Subtotal</th>
                    <th>Tax Rate</th>
                    <th>Tax Amount</th>
                    <th>Change</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{data.paymentDetails?.subtotal ?? '-'}</td>
                    <td>{(data.paymentDetails?.taxRate ?? 0) * 100}%</td>
                    <td>{data.paymentDetails?.taxAmount ?? '-'}</td>
                    <td>{data.paymentDetails?.change ?? '-'}</td>
                    <td>{data.paymentDetails?.totalAmount ?? '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* JSON */}
          <div className="card mb-5">
            <div className="card-header">Raw JSON</div>
            <div className="card-body">
              <pre className="text-sm">{JSON.stringify(invoice.parsedData, null, 2)}</pre>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default InvoiceDetail

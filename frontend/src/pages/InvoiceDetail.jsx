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
        setError('Fatura verisi alınamadı')
      }
    }

    fetchInvoice()
  }, [id])

  const handleToggleImage = () => setShowImage(!showImage)

  const data = invoice?.parsedData || {}

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Fatura Detayı</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      {invoice && (
        <>
          {/* 🖼️ Görsel kartı */}
          {invoice.imagePath && (
            <div className="card mb-3" style={{ cursor: 'pointer' }}>
              <div
                className="card-header d-flex justify-content-between align-items-center"
                onClick={handleToggleImage}
              >
                <span>Yüklenen Görsel</span>
                <span style={{ fontSize: '20px' }}>
                  {showImage ? '▲' : '▼'}
                </span>
              </div>
              {showImage && (
                <div className="card-body text-center">
                  <img
                    src={`http://localhost:3000/${invoice.imagePath.replace(/\\/g, '/')}`}
                    alt="Fatura Görseli"
                    className="img-fluid"
                    style={{ maxHeight: '400px' }}
                  />
                </div>
              )}
            </div>
          )}

          {/* 📄 Genel Bilgiler */}
          <div className="card mb-3">
            <div className="card-body">
              <p><strong>Dosya Adı:</strong> {invoice.filename}</p>
              <p><strong>Yükleme Tarihi:</strong> {new Date(invoice.createdAt).toLocaleString()}</p>
            </div>
          </div>

          {/* 🏪 Mağaza Bilgisi */}
          <div className="card mb-3">
            <div className="card-header">Mağaza Bilgisi</div>
            <div className="card-body">
              <p><strong>Unvan:</strong> {data.magazaBilgisi?.unvan}</p>
              <p><strong>Adres:</strong> {data.magazaBilgisi?.adres}</p>
              <p><strong>Telefon:</strong> {data.magazaBilgisi?.magazaTelefon}</p>
              <p><strong>Email:</strong> {data.magazaBilgisi?.email}</p>
              <p><strong>Fiş/Fatura No:</strong> {data.magazaBilgisi?.fisNumarasi}</p>
              <p><strong>Tarih:</strong> {data.magazaBilgisi?.tarih}</p>
            </div>
          </div>

          {/* 👤 Müşteri Bilgisi */}
          <div className="card mb-3">
            <div className="card-header">Müşteri Bilgisi</div>
            <div className="card-body">
              <p><strong>İsim Soyisim:</strong> {data.musteriBilgisi?.isimSoyisim}</p>
              <p><strong>Email:</strong> {data.musteriBilgisi?.email}</p>
              <p><strong>Telefon:</strong> {data.musteriBilgisi?.telefon}</p>
              <p><strong>Vergi No:</strong> {data.musteriBilgisi?.vergino || 'Yok'}</p>
            </div>
          </div>

          {/* 📦 Ürün Kalemleri */}
          <div className="card mb-3">
            <div className="card-header">Ürün Kalemleri</div>
            <div className="card-body p-0">
              <table className="table table-striped mb-0">
                <thead>
                  <tr>
                    <th>Ürün Adı</th>
                    <th>Miktar</th>
                    <th>Birim Fiyat</th>
                    <th>Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.urunKalemleri || []).map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.urunAdi}</td>
                      <td>{item.miktar}</td>
                      <td>{item.birimFiyat}</td>
                      <td>{item.satirToplam}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 💳 Ödeme Bilgileri */}
          <div className="card mb-3">
            <div className="card-header">Ödeme Bilgileri</div>
            <div className="card-body">
              <p><strong>Ara Toplam:</strong> {data.odemeBilgileri?.araToplam}</p>
              <p><strong>Vergi Oranı:</strong> %{(data.odemeBilgileri?.vergiOrani || 0) * 100}</p>
              <p><strong>Vergi Tutarı:</strong> {data.odemeBilgileri?.vergiTutari}</p>
              <p><strong>Genel Toplam:</strong> {data.odemeBilgileri?.genelToplam}</p>
              <p><strong>Ödenen Tutar:</strong> {data.odemeBilgileri?.odenenTutar}</p>
            </div>
          </div>

          {/* 🧾 JSON Ham Verisi */}
          <div className="card mb-5">
            <div className="card-header">JSON Verisi</div>
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

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
            <div className="card-body p-0">
              <table className="table table-bordered mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Unvan</th>
                    <th>Adres</th>
                    <th>Telefon</th>
                    <th>Email</th>
                    <th>Fiş/Fatura No</th>
                    <th>Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{data.magazaBilgisi?.unvan || '-'}</td>
                    <td>{data.magazaBilgisi?.adres || '-'}</td>
                    <td>{data.magazaBilgisi?.magazaTelefon || '-'}</td>
                    <td>{data.magazaBilgisi?.email || '-'}</td>
                    <td>{data.magazaBilgisi?.fisNumarasi || '-'}</td>
                    <td>{data.magazaBilgisi?.tarih || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 👤 Müşteri Bilgisi */}
          <div className="card mb-3">
            <div className="card-header">Müşteri Bilgisi</div>
            <div className="card-body p-0">
              <table className="table table-bordered mb-0">
                <thead className="table-light">
                  <tr>
                    <th>İsim Soyisim</th>
                    <th>Email</th>
                    <th>Telefon</th>
                    <th>Vergi No</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{data.musteriBilgisi?.isimSoyisim || '-'}</td>
                    <td>{data.musteriBilgisi?.email || '-'}</td>
                    <td>{data.musteriBilgisi?.telefon || '-'}</td>
                    <td>{data.musteriBilgisi?.vergino || '-'}</td>
                  </tr>
                </tbody>
              </table>
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
            <div className="card-body p-0">
              <table className="table table-bordered mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Ara Toplam</th>
                    <th>Vergi Oranı</th>
                    <th>Vergi Tutarı</th>
                    <th>Ödenen Tutar</th>
                    <th>Genel Toplam</th>

                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{data.odemeBilgileri?.araToplam ?? '-'}</td>
                    <td>%{(data.odemeBilgileri?.vergiOrani ?? 0) * 100}</td>
                    <td>{data.odemeBilgileri?.vergiTutari ?? '-'}</td>
                    <td>{data.odemeBilgileri?.odenenTutar ?? '-'}</td>
                    <td>{data.odemeBilgileri?.genelToplam ?? '-'}</td>

                  </tr>
                </tbody>
              </table>
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

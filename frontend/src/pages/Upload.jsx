import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Upload() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const token = localStorage.getItem('token')
      await axios.post('http://localhost:3000/api/invoices', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      navigate('/invoices')
    } catch (err) {
      setError('Yükleme sırasında bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container d-flex align-items-center justify-content-center vh-100">
      <div className="card p-4 shadow" style={{ width: '100%', maxWidth: '500px' }}>
        <h3 className="text-center mb-4">Fatura Yükle</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input type="file" onChange={handleFileChange} className="form-control" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-success w-100"
          >
            {loading ? 'Yükleniyor...' : 'Yükle ve İşle'}
          </button>
          {error && <div className="alert alert-danger mt-3 py-1">{error}</div>}
        </form>
      </div>
    </div>
  )
}

export default Upload

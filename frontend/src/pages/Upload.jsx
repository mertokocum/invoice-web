import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Upload() {
  const [file, setFile] = useState(null)
  const [model, setModel] = useState("gemma3:12b")
  const [docType, setDocType] = useState("fatura")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleFileChange = (e) => setFile(e.target.files[0])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('model', model)
    formData.append('docType', docType)

    try {
      const token = localStorage.getItem('token')
      await axios.post('http://localhost:3000/api/invoices', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
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
    <div className="container mt-5">
      <h2 className="text-center mb-4">Fatura veya Fiş Yükle</h2>
      <form onSubmit={handleSubmit} className="card p-4 shadow">
        <div className="mb-3">
          <input type="file" className="form-control" onChange={handleFileChange} />
        </div>
        <div className="mb-3">
          <select className="form-select" value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="gemma3:12b">Daha doğru: Gemma 12B</option>
            <option value="llama3:8b">Daha hızlı: LLaMA 3 8B</option>
          </select>
        </div>
        <div className="mb-3">
          <select className="form-select" value={docType} onChange={(e) => setDocType(e.target.value)}>
            <option value="fatura">Fatura</option>
            <option value="fis">Fiş</option>
          </select>
        </div>

        <button type="submit" className="btn btn-success w-100" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Yükleniyor...
            </>
          ) : 'Yükle ve İşle'}
        </button>

        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </form>
    </div>
  )
}

export default Upload

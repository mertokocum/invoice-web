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
    formData.append('model', model)
    formData.append('docType', docType)

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
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-semibold mb-4">Fatura veya Fiş Yükle</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4 w-96">
        <input type="file" onChange={handleFileChange} className="w-full" />

        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="gemma3:12b">Gemma 12B</option>
          <option value="llama3:8b">LLaMA 3 8B</option>
          <option value="llama2:7b">LLaMA 2 7B</option>

        </select>

        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="fatura">Fatura</option>
          <option value="fis">Fiş</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          {loading ? 'Yükleniyor...' : 'Yükle ve İşle'}
        </button>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </div>
  )
}

export default Upload

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isRegister, setIsRegister] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (isRegister) {
        // Kayıt
        await axios.post('http://localhost:3000/api/auth/register', { username, password })
        alert('Kayıt başarılı! Giriş yapabilirsiniz.')
        setIsRegister(false)
        setUsername('')
        setPassword('')
      } else {
        // Giriş
        const res = await axios.post('http://localhost:3000/api/auth/login', { username, password })
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('role', res.data.role)
        navigate(res.data.role === 'admin' ? '/invoices' : '/upload')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'İşlem sırasında hata oluştu.')
    }
    console.log('Register payload:', { username, password, role })

  }

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow" style={{ width: '350px' }}>
        <h3 className="mb-3 text-center">{isRegister ? 'Kayıt Ol' : 'Giriş Yap'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Kullanıcı Adı"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            {isRegister ? 'Kayıt Ol' : 'Giriş Yap'}
          </button>
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </form>
        <div className="text-center mt-3">
          <button
            className="btn btn-link"
            onClick={() => {
              setIsRegister(!isRegister)
              setError(null)
            }}
          >
            {isRegister ? 'Zaten hesabınız var mı? Giriş yap' : 'Hesabınız yok mu? Kayıt ol'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login

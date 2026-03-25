'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import styles from '../login/auth.module.css'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError('Mật khẩu không khớp'); return }
    if (password.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự'); return }
    setLoading(true)
    const result = await register(name, email, password)
    if (result.success) {
      router.push('/')
    } else {
      setError(result.error || 'Đăng ký thất bại')
    }
    setLoading(false)
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <Link href="/" className={styles.authLogo}>🛒 Shop<span>VN</span></Link>
          <h1>Đăng ký tài khoản</h1>
          <p>Tạo tài khoản để bắt đầu mua sắm</p>
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label className="form-label">Họ tên</label><input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Nguyễn Văn A" required /></div>
          <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" required /></div>
          <div className="form-group"><label className="form-label">Mật khẩu</label><input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} placeholder="Tối thiểu 6 ký tự" required /></div>
          <div className="form-group"><label className="form-label">Xác nhận mật khẩu</label><input type="password" className="form-input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu" required /></div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>
        <p className={styles.authFooter}>Đã có tài khoản? <Link href="/login">Đăng nhập</Link></p>
      </div>
    </div>
  )
}

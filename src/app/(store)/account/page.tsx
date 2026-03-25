'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function ProfilePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  if (!user) return null

  return (
    <div className="card">
      <div className="card-body">
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Hồ sơ của tôi</h2>
        <form style={{ maxWidth: '500px' }}>
          <div className="form-group"><label className="form-label">Họ tên</label><input className="form-input" defaultValue={user.name} /></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" defaultValue={user.email} disabled /></div>
          <div className="form-group"><label className="form-label">Số điện thoại</label><input className="form-input" defaultValue={user.phone || ''} placeholder="Thêm số điện thoại" /></div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }} disabled={loading}>Lưu thay đổi</button>
        </form>
      </div>
    </div>
  )
}

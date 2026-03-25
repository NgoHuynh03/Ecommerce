'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency } from '@/lib/utils'
import styles from './checkout.module.css'

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ shippingName: user?.name || '', shippingPhone: '', shippingAddress: '', shippingCity: '', shippingDistrict: '', paymentMethod: 'cod', note: '' })
  const [loading, setLoading] = useState(false)
  const shippingFee = totalAmount >= 500000 ? 0 : 30000

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.shippingName || !form.shippingPhone || !form.shippingAddress || !form.shippingCity) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, shippingFee }),
      })
      const data = await res.json()
      if (data.success) {
        await clearCart()
        router.push(`/account/orders?success=${data.data.orderNumber}`)
      } else {
        alert(data.error || 'Đã xảy ra lỗi')
      }
    } catch { alert('Đã xảy ra lỗi') }
    setLoading(false)
  }

  if (items.length === 0) {
    router.push('/cart')
    return null
  }

  return (
    <div className={styles.checkoutPage}>
      <div className="container">
        <h1 className={styles.pageTitle}>Thanh toán</h1>
        <form onSubmit={handleSubmit} className={styles.layout}>
          <div className={styles.formSection}>
            <div className={styles.formCard}>
              <h2>📍 Thông tin giao hàng</h2>
              <div className="form-group"><label className="form-label">Họ tên *</label><input className="form-input" value={form.shippingName} onChange={e => setForm({...form, shippingName: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Số điện thoại *</label><input className="form-input" value={form.shippingPhone} onChange={e => setForm({...form, shippingPhone: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Địa chỉ *</label><input className="form-input" value={form.shippingAddress} onChange={e => setForm({...form, shippingAddress: e.target.value})} required /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group"><label className="form-label">Tỉnh/Thành phố *</label><input className="form-input" value={form.shippingCity} onChange={e => setForm({...form, shippingCity: e.target.value})} required /></div>
                <div className="form-group"><label className="form-label">Quận/Huyện</label><input className="form-input" value={form.shippingDistrict} onChange={e => setForm({...form, shippingDistrict: e.target.value})} /></div>
              </div>
              <div className="form-group"><label className="form-label">Ghi chú</label><textarea className="form-input form-textarea" placeholder="Ghi chú cho đơn hàng..." value={form.note} onChange={e => setForm({...form, note: e.target.value})} /></div>
            </div>
            <div className={styles.formCard}>
              <h2>💳 Phương thức thanh toán</h2>
              <div className={styles.paymentOptions}>
                {[{ value: 'cod', label: '💵 Thanh toán khi nhận hàng (COD)' }, { value: 'bank_transfer', label: '🏦 Chuyển khoản ngân hàng' }, { value: 'credit_card', label: '💳 Thẻ tín dụng / Ghi nợ' }].map(p => (
                  <label key={p.value} className={`${styles.paymentOption} ${form.paymentMethod === p.value ? styles.selected : ''}`}>
                    <input type="radio" name="paymentMethod" value={p.value} checked={form.paymentMethod === p.value} onChange={e => setForm({...form, paymentMethod: e.target.value})} />
                    <span>{p.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.orderSummary}>
            <div className={styles.summaryCard}>
              <h3>Đơn hàng ({items.length} sản phẩm)</h3>
              <div className={styles.orderItems}>
                {items.map(item => (
                  <div key={item.id} className={styles.orderItem}>
                    <img src={item.product.images?.[0]?.url || 'https://placehold.co/60/e2e8f0/94a3b8'} alt="" />
                    <div><p>{item.product.name}</p><span>x{item.quantity}</span></div>
                    <strong>{formatCurrency((item.product.salePrice || item.product.price) * item.quantity)}</strong>
                  </div>
                ))}
              </div>
              <div className={styles.summaryRow}><span>Tạm tính</span><span>{formatCurrency(totalAmount)}</span></div>
              <div className={styles.summaryRow}><span>Vận chuyển</span><span>{shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}</span></div>
              <div className={`${styles.summaryRow} ${styles.total}`}><span>Tổng cộng</span><span>{formatCurrency(totalAmount + shippingFee)}</span></div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '20px' }} disabled={loading}>
                {loading ? 'Đang xử lý...' : '🛒 Đặt hàng'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

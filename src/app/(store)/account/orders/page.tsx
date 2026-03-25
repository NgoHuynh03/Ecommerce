'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Order } from '@/types'
import { formatCurrency, getStatusLabel, getStatusColor, formatDate } from '@/lib/utils'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/orders').then(r => r.json()).then(d => {
      if (d.success) setOrders(d.data)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="loading-spinner" style={{ margin: '40px auto' }}></div>

  if (orders.length === 0) {
    return (
      <div className="card">
        <div className="card-body empty-state">
          <h3>Chưa có đơn hàng nào</h3>
          <p>Bạn chưa thực hiện đơn hàng nào trên ShopVN</p>
          <Link href="/products" className="btn btn-primary">Mua sắm ngay</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-body">
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Đơn hàng của tôi</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map(order => (
            <div key={order.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>Đơn hàng #{order.orderNumber}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatDate(order.createdAt)}</div>
                </div>
                <div>
                  <span className="badge" style={{ backgroundColor: getStatusColor(order.status), color: '#fff' }}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {order.items.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <img src={item.image || 'https://placehold.co/60x60'} alt="" style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 500, fontSize: '14px' }}>{item.name}</p>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>x{item.quantity}</span>
                    </div>
                    <strong style={{ fontSize: '14px' }}>{formatCurrency(item.price)}</strong>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <div><strong>Tổng tiền: <span style={{ color: 'var(--color-secondary)', fontSize: '18px' }}>{formatCurrency(order.totalAmount + order.shippingFee - order.discount)}</span></strong></div>
                <button className="btn btn-secondary btn-sm">Xem chi tiết</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Order } from '@/types'
import { formatCurrency, getStatusColor, getStatusLabel, formatDate } from '@/lib/utils'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = () => {
    setLoading(true)
    fetch('/api/orders?limit=50')
      .then(r => r.json())
      .then(d => {
        if (d.success) setOrders(d.data)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Quản lý Đơn hàng</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{orders.length} đơn hàng</p>
        </div>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã ĐH</th>
                <th>Khách hàng</th>
                <th>Ngày đặt</th>
                <th>Tổng thanh toán</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner"></div></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>Không có đơn hàng nào</td></tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id}>
                    <td><strong>#{order.orderNumber}</strong></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{order.shippingName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{order.shippingPhone}</div>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td><strong style={{ color: 'var(--color-secondary)' }}>{formatCurrency(order.totalAmount + order.shippingFee - order.discount)}</strong></td>
                    <td>
                      <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                        {getStatusLabel(order.paymentStatus)}
                      </span>
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: getStatusColor(order.status), color: 'white' }}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-secondary" onClick={() => alert('Chi tiết đơn hàng đang phát triển')}>Chi tiết</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

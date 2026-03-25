'use client'

import { useState, useEffect } from 'react'
import { DashboardStats } from '@/types'
import { formatCurrency, getStatusColor, getStatusLabel, formatDate } from '@/lib/utils'
import Link from 'next/link'
import styles from './page.module.css'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/stats').then(r => r.json()).then(d => {
      if (d.success) setStats(d.data)
      setLoading(false)
    })
  }, [])

  if (loading || !stats) return <div className="loading-page"><div className="loading-spinner"></div></div>

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Tổng quan</h1>
        <div className={styles.dateRange}>Cập nhật mới nhất: {new Date().toLocaleString('vi-VN')}</div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>💵</div>
          <div className={styles.statInfo}>
            <p>Doanh thu</p>
            <h3>{formatCurrency(stats.totalRevenue)}</h3>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>📦</div>
          <div className={styles.statInfo}>
            <p>Đơn hàng</p>
            <h3>{stats.totalOrders}</h3>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>🏷️</div>
          <div className={styles.statInfo}>
            <p>Sản phẩm</p>
            <h3>{stats.totalProducts}</h3>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>👥</div>
          <div className={styles.statInfo}>
            <p>Khách hàng</p>
            <h3>{stats.totalUsers}</h3>
          </div>
        </div>
      </div>

      <div className={styles.columns}>
        {/* Charts & Graphs placeholder - simple HTML representation */}
        <div className="card">
          <div className="card-body">
            <h2 className={styles.cardTitle}>Doanh thu 6 tháng gần nhất</h2>
            <div className={styles.chartContainer}>
              <div className={styles.barChart}>
                {stats.monthlyRevenue.map((m, i) => {
                  const maxParams = Math.max(...stats.monthlyRevenue.map(mr => mr.revenue)) || 1
                  const height = `${(m.revenue / maxParams) * 100}%`
                  return (
                    <div key={i} className={styles.barItem}>
                      <div className={styles.barWrapper}>
                        <div className={styles.bar} style={{ height }} title={formatCurrency(m.revenue)}></div>
                      </div>
                      <span className={styles.barLabel}>{m.month}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Order Status */}
        <div className="card">
          <div className="card-body">
            <h2 className={styles.cardTitle}>Trạng thái đơn hàng</h2>
            <div className={styles.statusList}>
              {stats.ordersByStatus.map(s => (
                <div key={s.status} className={styles.statusItem}>
                  <div className={styles.statusName}>
                    <span className={styles.statusDot} style={{ background: getStatusColor(s.status) }}></span>
                    {getStatusLabel(s.status)}
                  </div>
                  <div className={styles.statusCount}>
                    <strong>{s.count}</strong>
                    <span>({Math.round((s.count / stats.totalOrders) * 100 || 0)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className={styles.cardTitle} style={{ margin: 0 }}>Đơn hàng gần đây</h2>
            <Link href="/admin/orders" className="btn btn-sm btn-secondary">Xem tất cả</Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã ĐH</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map(order => (
                  <tr key={order.id}>
                    <td><Link href={`/admin/orders/${order.id}`} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>#{order.orderNumber}</Link></td>
                    <td>
                      <div><strong>{order.shippingName}</strong></div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{order.user?.email}</div>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td><strong>{formatCurrency(order.totalAmount + order.shippingFee - order.discount)}</strong></td>
                    <td>
                      <span className="badge" style={{ backgroundColor: getStatusColor(order.status), color: 'white' }}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import styles from './admin.module.css'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [isSidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading || !user || user.role !== 'admin') {
    return <div className="loading-page"><div className="loading-spinner"></div></div>
  }

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? '' : styles.sidebarClosed}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/admin" className={styles.logo}>
            🛒 Shop<span>Admin</span>
          </Link>
          <button className={styles.closeBtn} onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <nav className={styles.nav}>
          <div className={styles.navGroup}>
            <span>Tổng quan</span>
            <Link href="/admin">📊 Dashboard</Link>
          </div>
          <div className={styles.navGroup}>
            <span>Quản lý bán hàng</span>
            <Link href="/admin/orders">📦 Đơn hàng</Link>
            <Link href="/admin/products">🏷️ Sản phẩm</Link>
            <Link href="/admin/categories">📁 Danh mục</Link>
          </div>
          <div className={styles.navGroup}>
            <span>Hệ thống</span>
            <Link href="/admin/users">👥 Thành viên</Link>
          </div>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)}></div>}

      {/* Main Content */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.toggleBtn} onClick={() => setSidebarOpen(!isSidebarOpen)}>☰</button>
            <div className={styles.breadcrumb}>Admin Panel</div>
          </div>
          <div className={styles.headerRight}>
            <Link href="/" className="btn btn-sm btn-secondary" target="_blank">👁️ Xem website</Link>
            <div className={styles.userProfile}>
              <div className={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
              <div className={styles.userInfo}>
                <strong>{user.name}</strong>
                <span>Admin</span>
              </div>
            </div>
            <button onClick={logout} className="btn-icon" title="Đăng xuất">🚪</button>
          </div>
        </header>
        <div className={styles.content}>
          <div className={styles.contentInner}>
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

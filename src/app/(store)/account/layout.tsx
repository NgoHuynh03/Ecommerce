'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import styles from './account.module.css'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  if (loading || !user) return <div className="loading-page"><div className="loading-spinner"></div></div>

  return (
    <div className={styles.accountPage}>
      <div className="container">
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
              <div>
                <h3 className={styles.userName}>{user.name}</h3>
                <p className={styles.userEmail}>{user.email}</p>
              </div>
            </div>
            <nav className={styles.nav}>
              <Link href="/account" className={styles.navLink}>👤 Thông tin tài khoản</Link>
              <Link href="/account/orders" className={styles.navLink}>📦 Quản lý đơn hàng</Link>
              <Link href="/account/wishlist" className={styles.navLink}>❤️ Sản phẩm yêu thích</Link>
              <Link href="/account/addresses" className={styles.navLink}>📍 Sổ địa chỉ</Link>
              <button onClick={logout} className={`${styles.navLink} ${styles.logoutBtn}`}>🚪 Đăng xuất</button>
            </nav>
          </aside>
          <div className={styles.content}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

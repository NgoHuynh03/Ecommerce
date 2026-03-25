'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { Category } from '@/types'
import styles from './StoreHeader.module.css'

export default function StoreHeader() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => { if (d.success) setCategories(d.data.filter((c: Category) => !c.parentId)) })
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowMobileMenu(false)
    }
  }

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.topBar}>
        <div className="container">
          <div className={styles.topBarContent}>
            <span>🎉 Miễn phí vận chuyển cho đơn hàng từ 500.000₫</span>
            <div className={styles.topBarLinks}>
              <Link href="/account">Theo dõi đơn hàng</Link>
              <span className={styles.divider}>|</span>
              <Link href="/account">Hỗ trợ</Link>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainHeader}>
        <div className="container">
          <div className={styles.mainHeaderContent}>
            <Link href="/" className={styles.logo}>
              <span className={styles.logoIcon}>🛒</span>
              <span className={styles.logoText}>Shop<span>VN</span></span>
            </Link>

            <form onSubmit={handleSearch} className={styles.searchForm}>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchBtn}>
                🔍
              </button>
            </form>

            <div className={styles.headerActions}>
              {user ? (
                <div className={styles.userMenu} ref={userMenuRef}>
                  <button onClick={() => setShowUserMenu(!showUserMenu)} className={styles.userBtn}>
                    <span className={styles.userAvatar}>{user.name.charAt(0).toUpperCase()}</span>
                    <span className={styles.userName}>{user.name}</span>
                  </button>
                  {showUserMenu && (
                    <div className={styles.userDropdown}>
                      <Link href="/account" onClick={() => setShowUserMenu(false)}>👤 Tài khoản</Link>
                      <Link href="/account/orders" onClick={() => setShowUserMenu(false)}>📦 Đơn hàng</Link>
                      <Link href="/account/wishlist" onClick={() => setShowUserMenu(false)}>❤️ Yêu thích</Link>
                      {user.role === 'admin' && (
                        <Link href="/admin" onClick={() => setShowUserMenu(false)}>⚙️ Quản trị</Link>
                      )}
                      <button onClick={logout} className={styles.logoutBtn}>🚪 Đăng xuất</button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className={styles.loginBtn}>
                  👤 Đăng nhập
                </Link>
              )}

              <Link href="/cart" className={styles.cartBtn}>
                🛒
                {itemCount > 0 && <span className={styles.cartBadge}>{itemCount}</span>}
              </Link>

              <button
                className={styles.mobileMenuBtn}
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? '✕' : '☰'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <nav className={styles.nav}>
        <div className="container">
          <ul className={styles.navList}>
            <li><Link href="/" className={styles.navLink}>Trang chủ</Link></li>
            <li className={styles.navDropdown}>
              <span className={styles.navLink}>Danh mục ▾</span>
              <div className={styles.dropdownMenu}>
                {categories.map(cat => (
                  <Link key={cat.id} href={`/products?category=${cat.slug}`} className={styles.dropdownItem}>
                    {cat.name}
                  </Link>
                ))}
              </div>
            </li>
            <li><Link href="/products" className={styles.navLink}>Sản phẩm</Link></li>
            <li><Link href="/products?featured=true" className={styles.navLink}>Nổi bật</Link></li>
            <li><Link href="/products?sort=price-asc" className={styles.navLink}>Khuyến mãi</Link></li>
          </ul>
        </div>
      </nav>

      {showMobileMenu && (
        <div className={styles.mobileMenu}>
          <form onSubmit={handleSearch} className={styles.mobileSearch}>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button type="submit">🔍</button>
          </form>
          <nav className={styles.mobileNav}>
            <Link href="/" onClick={() => setShowMobileMenu(false)}>Trang chủ</Link>
            <Link href="/products" onClick={() => setShowMobileMenu(false)}>Sản phẩm</Link>
            {categories.map(cat => (
              <Link key={cat.id} href={`/products?category=${cat.slug}`} onClick={() => setShowMobileMenu(false)}>
                {cat.name}
              </Link>
            ))}
            <Link href="/products?featured=true" onClick={() => setShowMobileMenu(false)}>Nổi bật</Link>
            {!user && <Link href="/login" onClick={() => setShowMobileMenu(false)}>Đăng nhập</Link>}
            {user && (
              <>
                <Link href="/account" onClick={() => setShowMobileMenu(false)}>Tài khoản</Link>
                <Link href="/account/orders" onClick={() => setShowMobileMenu(false)}>Đơn hàng</Link>
                {user.role === 'admin' && <Link href="/admin" onClick={() => setShowMobileMenu(false)}>Quản trị</Link>}
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Product, Category } from '@/types'
import { formatCurrency, calculateDiscount } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'
import styles from './page.module.css'

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    Promise.all([
      fetch('/api/products?featured=true&limit=8').then(r => r.json()),
      fetch('/api/products?sort=newest&limit=8').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ])
      .then(([featured, newest, cats]) => {
        if (featured?.success) setFeaturedProducts(featured.data)
        if (newest?.success) setNewProducts(newest.data)
        if (cats?.success && Array.isArray(cats.data)) {
          setCategories(cats.data.filter((c: Category) => !c.parentId))
        }
      })
      .catch((err) => {
        console.error('Error fetching homepage data:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.round(rating) ? 'star filled' : 'star'}>★</span>
    ))
  }

  const ProductCard = ({ product }: { product: Product }) => {
    const discount = product.salePrice ? calculateDiscount(product.price, product.salePrice) : 0
    const imageUrl = product.images?.[0]?.url || 'https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image'
    return (
      <div className="product-card">
        <Link href={`/products/${product.slug}`}>
          <div className="product-card-image">
            <img src={imageUrl} alt={product.name} />
            {discount > 0 && (
              <div className="product-card-badge">
                <span className="badge badge-danger">-{discount}%</span>
              </div>
            )}
            <div className="product-card-actions">
              <button className="product-card-action-btn" onClick={(e) => { e.preventDefault(); addToCart(product.id) }} title="Thêm vào giỏ">🛒</button>
              <button className="product-card-action-btn" title="Yêu thích">❤️</button>
            </div>
          </div>
        </Link>
        <div className="product-card-content">
          <p className="product-card-category">{product.category?.name}</p>
          <Link href={`/products/${product.slug}`}>
            <h3 className="product-card-name">{product.name}</h3>
          </Link>
          <div className="product-card-rating">
            <span className="stars star-rating">{renderStars(product.rating)}</span>
            <span>({product.reviewCount})</span>
          </div>
          <div className="product-card-price">
            <span className="current">{formatCurrency(product.salePrice || product.price)}</span>
            {product.salePrice && <span className="original">{formatCurrency(product.price)}</span>}
            {discount > 0 && <span className="discount">-{discount}%</span>}
          </div>
        </div>
      </div>
    )
  }

  if (loading) return <div className="loading-page"><div className="loading-spinner"></div><p>Đang tải...</p></div>

  return (
    <div>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <span className={styles.heroBadge}>🔥 Hot Sale 2024</span>
              <h1 className={styles.heroTitle}>
                Mua sắm thông minh<br />
                <span>Giá cả hợp lý</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Hàng triệu sản phẩm chính hãng, giao hàng nhanh toàn quốc. Miễn phí vận chuyển cho đơn từ 500.000₫.
              </p>
              <div className={styles.heroButtons}>
                <Link href="/products" className="btn btn-primary btn-lg">Mua sắm ngay →</Link>
                <Link href="/products?featured=true" className="btn btn-secondary btn-lg">Xem khuyến mãi</Link>
              </div>
              <div className={styles.heroStats}>
                <div className={styles.stat}><strong>10K+</strong><span>Sản phẩm</span></div>
                <div className={styles.stat}><strong>50K+</strong><span>Khách hàng</span></div>
                <div className={styles.stat}><strong>99%</strong><span>Hài lòng</span></div>
              </div>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.heroCard}>
                <div className={styles.heroCardInner}>
                  <span className={styles.heroEmoji}>🛍️</span>
                  <h3>Flash Sale</h3>
                  <p>Giảm đến 50%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Danh mục nổi bật</h2>
          <p className="section-subtitle">Khám phá sản phẩm theo danh mục yêu thích của bạn</p>
          <div className={styles.categoryGrid}>
            {categories.slice(0, 8).map(cat => (
              <Link key={cat.id} href={`/products?category=${cat.slug}`} className={styles.categoryCard}>
                <div className={styles.categoryIcon}>{cat.image || '📦'}</div>
                <h3>{cat.name}</h3>
                <span>{cat._count?.products || 0} sản phẩm</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section" style={{ background: 'var(--bg-primary)' }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <h2 className="section-title">Sản phẩm nổi bật</h2>
              <p className="section-subtitle" style={{ marginBottom: 0 }}>Được yêu thích nhất tại ShopVN</p>
            </div>
            <Link href="/products?featured=true" className="btn btn-secondary">Xem tất cả →</Link>
          </div>
          <div className="products-grid">
            {featuredProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className={styles.promoBanner}>
        <div className="container">
          <div className={styles.promoContent}>
            <div className={styles.promoText}>
              <span className={styles.promoTag}>⚡ Ưu đãi đặc biệt</span>
              <h2>Giảm đến 50% cho khách hàng mới</h2>
              <p>Đăng ký tài khoản ngay để nhận voucher giảm giá cực sốc cho lần mua hàng đầu tiên!</p>
              <Link href="/register" className="btn btn-primary btn-lg">Đăng ký ngay!</Link>
            </div>
            <div className={styles.promoVisual}>🎁</div>
          </div>
        </div>
      </section>

      {/* New Products */}
      <section className="section">
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <h2 className="section-title">Sản phẩm mới</h2>
              <p className="section-subtitle" style={{ marginBottom: 0 }}>Cập nhật mới nhất từ ShopVN</p>
            </div>
            <Link href="/products?sort=newest" className="btn btn-secondary">Xem tất cả →</Link>
          </div>
          <div className="products-grid">
            {newProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" style={{ background: 'var(--bg-primary)' }}>
        <div className="container">
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🚚</span>
              <h3>Giao hàng miễn phí</h3>
              <p>Miễn phí vận chuyển cho đơn từ 500K</p>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🔄</span>
              <h3>Đổi trả dễ dàng</h3>
              <p>Đổi trả miễn phí trong 30 ngày</p>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🔒</span>
              <h3>Thanh toán an toàn</h3>
              <p>Bảo mật thông tin thanh toán 100%</p>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>💬</span>
              <h3>Hỗ trợ 24/7</h3>
              <p>Đội ngũ chăm sóc khách hàng tận tâm</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

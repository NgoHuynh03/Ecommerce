'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Product } from '@/types'
import { formatCurrency, calculateDiscount } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    if (!query) {
      setProducts([])
      setLoading(false)
      return
    }

    setLoading(true)
    fetch(`/api/products?search=${encodeURIComponent(query)}&limit=24`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setProducts(d.data)
        setLoading(false)
      })
  }, [query])

  const renderStars = (rating: number) => Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < Math.round(rating) ? 'star filled' : 'star'}>★</span>
  ))

  if (loading) return <div className="loading-page"><div className="loading-spinner"></div></div>

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Kết quả tìm kiếm</h1>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Tìm thấy {products.length} kết quả cho từ khóa <strong>"{query}"</strong>
        </p>

        {products.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: '64px' }}>🔍</span>
            <h3>Không tìm thấy sản phẩm</h3>
            <p>Rất tiếc, chúng tôi không tìm thấy kết quả phù hợp với tìm kiếm của bạn.</p>
            <Link href="/products" className="btn btn-primary" style={{ marginTop: '16px' }}>Xem tất cả sản phẩm</Link>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => {
              const discount = product.salePrice ? calculateDiscount(product.price, product.salePrice) : 0
              const imageUrl = product.images?.[0]?.url || 'https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image'
              return (
                <div key={product.id} className="product-card">
                  <Link href={`/products/${product.slug}`}>
                    <div className="product-card-image">
                      <img src={imageUrl} alt={product.name} />
                      {discount > 0 && <div className="product-card-badge"><span className="badge badge-danger">-{discount}%</span></div>}
                      <div className="product-card-actions">
                        <button className="product-card-action-btn" onClick={e => { e.preventDefault(); addToCart(product.id) }}>🛒</button>
                      </div>
                    </div>
                  </Link>
                  <div className="product-card-content">
                    <p className="product-card-category">{product.category?.name}</p>
                    <Link href={`/products/${product.slug}`}><h3 className="product-card-name">{product.name}</h3></Link>
                    <div className="product-card-rating">
                      <span className="stars star-rating">{renderStars(product.rating)}</span>
                      <span>({product.reviewCount})</span>
                    </div>
                    <div className="product-card-price">
                      <span className="current">{formatCurrency(product.salePrice || product.price)}</span>
                      {product.salePrice && <span className="original">{formatCurrency(product.price)}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return <Suspense fallback={<div className="loading-page"><div className="loading-spinner"></div></div>}><SearchContent /></Suspense>
}

'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Product } from '@/types'
import { formatCurrency, calculateDiscount } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import styles from './detail.module.css'

export default function ProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product & { relatedProducts?: Product[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const { addToCart } = useCart()
  const { user } = useAuth()

  useEffect(() => {
    if (params.slug) {
      fetch(`/api/products/${params.slug}`).then(r => r.json()).then(d => {
        if (d.success) setProduct(d.data)
        setLoading(false)
      })
    }
  }, [params.slug])

  const handleAddToCart = async () => {
    if (product) {
      await addToCart(product.id, quantity)
      alert('✅ Đã thêm vào giỏ hàng!')
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { alert('Vui lòng đăng nhập để đánh giá'); return }
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product?.id, rating: reviewRating, comment: reviewText }),
    })
    const data = await res.json()
    if (data.success) {
      alert('Cảm ơn bạn đã đánh giá!')
      setReviewText('')
      // Refresh
      fetch(`/api/products/${params.slug}`).then(r => r.json()).then(d => { if (d.success) setProduct(d.data) })
    }
  }

  if (loading) return <div className="loading-page"><div className="loading-spinner"></div></div>
  if (!product) return <div className="empty-state"><h3>Sản phẩm không tồn tại</h3><Link href="/products" className="btn btn-primary">← Quay lại</Link></div>

  const discount = product.salePrice ? calculateDiscount(product.price, product.salePrice) : 0
  const images = product.images?.length ? product.images : [{ id: '0', url: 'https://placehold.co/600x600/e2e8f0/94a3b8?text=No+Image', alt: '', isPrimary: true, sortOrder: 0 }]

  return (
    <div className={styles.detailPage}>
      <div className="container">
        <div className={styles.breadcrumb}>
          <Link href="/">Trang chủ</Link> / <Link href="/products">Sản phẩm</Link> / <span>{product.name}</span>
        </div>

        <div className={styles.productMain}>
          {/* Images */}
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              <img src={images[selectedImage].url} alt={product.name} />
              {discount > 0 && <span className={styles.discountBadge}>-{discount}%</span>}
            </div>
            {images.length > 1 && (
              <div className={styles.thumbs}>
                {images.map((img, i) => (
                  <button key={img.id} className={`${styles.thumb} ${i === selectedImage ? styles.thumbActive : ''}`} onClick={() => setSelectedImage(i)}>
                    <img src={img.url} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className={styles.info}>
            <span className={styles.catLabel}>{product.category?.name}</span>
            <h1 className={styles.title}>{product.name}</h1>
            <div className={styles.ratingRow}>
              <div className="star-rating">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={`star ${i < Math.round(product.rating) ? 'filled' : ''}`}>★</span>
                ))}
              </div>
              <span>{product.rating} ({product.reviewCount} đánh giá)</span>
              <span>|</span>
              <span>{product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}</span>
            </div>

            <div className={styles.priceBox}>
              <span className={styles.priceMain}>{formatCurrency(product.salePrice || product.price)}</span>
              {product.salePrice && (
                <>
                  <span className={styles.priceOriginal}>{formatCurrency(product.price)}</span>
                  <span className={styles.priceSave}>Tiết kiệm {formatCurrency(product.price - product.salePrice)}</span>
                </>
              )}
            </div>

            <div className={styles.meta}>
              <div><strong>SKU:</strong> {product.sku}</div>
              {product.brand && <div><strong>Thương hiệu:</strong> {product.brand}</div>}
            </div>

            <div className={styles.quantityRow}>
              <span>Số lượng:</span>
              <div className={styles.quantityControl}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} min="1" max={product.stock} />
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
              </div>
            </div>

            <div className={styles.actions}>
              <button className="btn btn-primary btn-lg" onClick={handleAddToCart} disabled={product.stock === 0} style={{ flex: 1 }}>
                🛒 Thêm vào giỏ hàng
              </button>
              <button className="btn btn-secondary btn-lg">❤️</button>
            </div>

            <div className={styles.guarantees}>
              <div>🚚 Miễn phí vận chuyển</div>
              <div>🔄 Đổi trả trong 30 ngày</div>
              <div>✅ Hàng chính hãng 100%</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <div className={styles.tabHeader}>
            <button className={activeTab === 'description' ? styles.tabActive : ''} onClick={() => setActiveTab('description')}>Mô tả</button>
            <button className={activeTab === 'reviews' ? styles.tabActive : ''} onClick={() => setActiveTab('reviews')}>Đánh giá ({product.reviewCount})</button>
          </div>
          <div className={styles.tabContent}>
            {activeTab === 'description' && (
              <div className={styles.description}><p>{product.description}</p></div>
            )}
            {activeTab === 'reviews' && (
              <div className={styles.reviews}>
                {user && (
                  <form onSubmit={handleSubmitReview} className={styles.reviewForm}>
                    <h3>Viết đánh giá</h3>
                    <div className={styles.ratingSelect}>
                      {[1,2,3,4,5].map(r => (
                        <button type="button" key={r} onClick={() => setReviewRating(r)} className={r <= reviewRating ? styles.starActive : ''}>★</button>
                      ))}
                    </div>
                    <textarea className="form-input form-textarea" placeholder="Chia sẻ trải nghiệm của bạn..." value={reviewText} onChange={e => setReviewText(e.target.value)} required />
                    <button type="submit" className="btn btn-primary">Gửi đánh giá</button>
                  </form>
                )}
                {(product as unknown as { reviews: Array<{ id: string; user: { name: string }; rating: number; comment: string; createdAt: string }> }).reviews?.map((review) => (
                  <div key={review.id} className={styles.reviewItem}>
                    <div className={styles.reviewHeader}>
                      <strong>{review.user?.name}</strong>
                      <div className="star-rating">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i} className={`star ${i < review.rating ? 'filled' : ''}`}>★</span>
                        ))}
                      </div>
                    </div>
                    <p>{review.comment}</p>
                    <span className={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <section className="section">
            <h2 className="section-title">Sản phẩm liên quan</h2>
            <div className="products-grid">
              {product.relatedProducts.map(p => (
                <Link key={p.id} href={`/products/${p.slug}`} className="product-card">
                  <div className="product-card-image">
                    <img src={p.images?.[0]?.url || 'https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image'} alt={p.name} />
                  </div>
                  <div className="product-card-content">
                    <h3 className="product-card-name">{p.name}</h3>
                    <div className="product-card-price">
                      <span className="current">{formatCurrency(p.salePrice || p.price)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

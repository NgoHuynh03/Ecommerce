'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Product, Category } from '@/types'
import { formatCurrency, calculateDiscount } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'
import styles from './products.module.css'

function ProductsContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const { addToCart } = useCart()

  const page = parseInt(searchParams.get('page') || '1')
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'newest'
  const featured = searchParams.get('featured') || ''
  const search = searchParams.get('q') || ''

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', page.toString())
    params.set('limit', '12')
    if (category) params.set('category', category)
    if (sort) params.set('sort', sort)
    if (featured) params.set('featured', featured)
    if (search) params.set('search', search)

    fetch(`/api/products?${params}`).then(r => r.json()).then(d => {
      if (d.success) {
        setProducts(d.data)
        setTotalPages(d.pagination.totalPages)
      }
      setLoading(false)
    })
  }, [page, category, sort, featured, search])

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => {
      if (d.success) setCategories(d.data.filter((c: Category) => !c.parentId))
    })
  }, [])

  const buildUrl = (params: Record<string, string>) => {
    const sp = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([k, v]) => {
      if (v) sp.set(k, v) 
      else sp.delete(k)
    })
    return `/products?${sp.toString()}`
  }

  const renderStars = (rating: number) => Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < Math.round(rating) ? 'star filled' : 'star'}>★</span>
  ))

  return (
    <div className={styles.productsPage}>
      <div className="container">
        <div className={styles.breadcrumb}>
          <Link href="/">Trang chủ</Link> / <span>Sản phẩm</span>
          {category && <> / <span>{categories.find(c => c.slug === category)?.name}</span></>}
        </div>
        
        <div className={styles.layout}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.filterSection}>
              <h3>Danh mục</h3>
              <ul className={styles.catList}>
                <li><Link href={buildUrl({ category: '', page: '1' })} className={!category ? styles.active : ''}>Tất cả</Link></li>
                {categories.map(cat => (
                  <li key={cat.id}>
                    <Link href={buildUrl({ category: cat.slug, page: '1' })} className={category === cat.slug ? styles.active : ''}>
                      {cat.name} <span>({cat._count?.products || 0})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Products */}
          <div className={styles.main}>
            <div className={styles.toolbar}>
              <p className={styles.resultCount}>
                {loading ? 'Đang tải...' : `Hiển thị ${products.length} sản phẩm`}
              </p>
              <div className={styles.sortGroup}>
                <span>Sắp xếp:</span>
                <select value={sort} onChange={e => window.location.href = buildUrl({ sort: e.target.value, page: '1' })} className="form-input">
                  <option value="newest">Mới nhất</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                  <option value="rating">Đánh giá cao</option>
                  <option value="bestselling">Bán chạy</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="loading-page"><div className="loading-spinner"></div></div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <h3>Không tìm thấy sản phẩm</h3>
                <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                <Link href="/products" className="btn btn-primary">Xem tất cả sản phẩm</Link>
              </div>
            ) : (
              <>
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
                          <div className="product-card-rating"><span className="stars star-rating">{renderStars(product.rating)}</span><span>({product.reviewCount})</span></div>
                          <div className="product-card-price">
                            <span className="current">{formatCurrency(product.salePrice || product.price)}</span>
                            {product.salePrice && <span className="original">{formatCurrency(product.price)}</span>}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="pagination">
                    {page > 1 && <Link href={buildUrl({ page: (page - 1).toString() })} className="btn btn-sm btn-secondary">← Trước</Link>}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <Link key={p} href={buildUrl({ page: p.toString() })} className={p === page ? 'active' : ''}>{p}</Link>
                    ))}
                    {page < totalPages && <Link href={buildUrl({ page: (page + 1).toString() })} className="btn btn-sm btn-secondary">Sau →</Link>}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return <Suspense fallback={<div className="loading-page"><div className="loading-spinner"></div></div>}><ProductsContent /></Suspense>
}

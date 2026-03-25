'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Product, Category } from '@/types'
import { formatCurrency } from '@/lib/utils'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modal State
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: 0,
    salePrice: 0,
    sku: '',
    stock: 0,
    categoryId: '',
    brand: '',
    isFeatured: false,
    isActive: true
  })
  const [imageUrl, setImageUrl] = useState('')

  const fetchProducts = () => {
    setLoading(true)
    fetch(`/api/products?limit=50&search=${search}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setProducts(d.data)
        setLoading(false)
      })
  }

  const fetchCategories = () => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => {
        if (d.success) setCategories(d.data)
      })
  }

  useEffect(() => {
    fetchProducts()
  }, [search])

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        alert('Đã xóa thành công')
        fetchProducts()
      } else {
        alert(data.error)
      }
    }
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  const handleOpenAdd = () => {
    setEditingId(null)
    setFormData({
      name: '', slug: '', description: '', price: 0, salePrice: 0,
      sku: '', stock: 0, categoryId: '', brand: '', isFeatured: false, isActive: true
    })
    setImageUrl('')
    setShowForm(true)
  }

  const handleOpenEdit = (product: Product) => {
    setEditingId(product.id)
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      salePrice: product.salePrice || 0,
      sku: product.sku,
      stock: product.stock,
      categoryId: product.categoryId,
      brand: product.brand || '',
      isFeatured: product.isFeatured || false,
      isActive: product.isActive !== undefined ? product.isActive : true
    })
    setImageUrl(product.images?.[0]?.url || '')
    setShowForm(true)
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any
    let finalValue = value
    if (type === 'checkbox') finalValue = (e.target as HTMLInputElement).checked
    if (type === 'number') finalValue = value ? parseFloat(value) : 0
    
    setFormData(prev => {
      const newData = { ...prev, [name]: finalValue }
      if (name === 'name' && !editingId) {
        newData.slug = generateSlug(value)
      }
      return newData
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    if (!formData.categoryId) {
      alert('Vui lòng chọn danh mục')
      setIsSubmitting(false)
      return
    }

    const payload = {
      ...formData,
      images: imageUrl ? [{ url: imageUrl }] : []
    }

    try {
      const url = editingId ? `/api/products/${editingId}` : '/api/products'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.success) {
        alert(editingId ? 'Cập nhật thành công!' : 'Thêm mới thành công!')
        setShowForm(false)
        fetchProducts()
      } else {
        alert(data.error || 'Có lỗi xảy ra')
      }
    } catch (err) {
      alert('Lỗi kết nối mạng')
    }
    setIsSubmitting(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Quản lý Sản phẩm</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{products.length} sản phẩm</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            placeholder="Tìm kiếm sản phẩm..." 
            className="form-input" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '250px' }}
          />
          <button className="btn btn-primary" onClick={handleOpenAdd}>+ Thêm sản phẩm</button>
        </div>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá bán</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner"></div></td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>Không có sản phẩm nào</td></tr>
              ) : (
                products.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img 
                          src={product.images?.[0]?.url || 'https://placehold.co/48x48'} 
                          alt="" 
                          className="table-image"
                        />
                        <div>
                          <Link href={`/products/${product.slug}`} target="_blank" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {product.name}
                          </Link>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>SKU: {product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td>{product.category?.name || 'Không có'}</td>
                    <td>
                      <strong>{formatCurrency(product.salePrice || product.price)}</strong>
                      {product.salePrice ? <div style={{ fontSize: '12px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>{formatCurrency(product.price)}</div> : null}
                    </td>
                    <td>
                      <span className={`badge ${product.stock > 10 ? 'badge-success' : product.stock > 0 ? 'badge-warning' : 'badge-danger'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${product.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {product.isActive ? 'Đang bán' : 'Ngừng bán'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-icon" onClick={() => handleOpenEdit(product)} title="Sửa">✏️</button>
                        <button className="btn-icon" onClick={() => handleDelete(product.id)} title="Xóa" style={{ color: 'var(--color-danger)' }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Popup Form */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'var(--bg-primary, #fff)', width: '600px', maxWidth: '90%', borderRadius: '12px', padding: '24px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: 'bold' }}>
              {editingId ? '✏️ Cập nhật Sản Phẩm' : '✨ Thêm Sản Phẩm Mới'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label">Tên sản phẩm *</label>
                  <input required className="form-input" name="name" value={formData.name} onChange={handleFormChange} />
                </div>
                <div>
                  <label className="form-label">Đường dẫn tĩnh (Slug) *</label>
                  <input required className="form-input" name="slug" value={formData.slug} onChange={handleFormChange} />
                </div>
                <div>
                  <label className="form-label">Giá gốc (VNĐ) *</label>
                  <input required type="number" className="form-input" name="price" value={formData.price} onChange={handleFormChange} min="0" />
                </div>
                <div>
                  <label className="form-label">Giá khuyến mãi (VNĐ)</label>
                  <input type="number" className="form-input" name="salePrice" value={formData.salePrice} onChange={handleFormChange} min="0" />
                </div>
                <div>
                  <label className="form-label">Mã SKU *</label>
                  <input required className="form-input" name="sku" value={formData.sku} onChange={handleFormChange} />
                </div>
                <div>
                  <label className="form-label">Số lượng tồn kho *</label>
                  <input required type="number" className="form-input" name="stock" value={formData.stock} onChange={handleFormChange} min="0" />
                </div>
                <div>
                  <label className="form-label">Danh mục *</label>
                  <select required className="form-input" name="categoryId" value={formData.categoryId} onChange={handleFormChange}>
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Thương hiệu</label>
                  <input className="form-input" name="brand" value={formData.brand} onChange={handleFormChange} />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Mô tả sản phẩm *</label>
                <textarea required className="form-input" name="description" value={formData.description} onChange={handleFormChange} rows={4} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Đường dẫn hình ảnh (URL)</label>
                <input className="form-input" placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                {imageUrl && <img src={imageUrl} alt="preview" style={{ marginTop: '8px', height: '60px', borderRadius: '4px', objectFit: 'cover' }} />}
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleFormChange} />
                  Sản phẩm nổi bật
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleFormChange} />
                  Hiển thị / Đang bán
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)} disabled={isSubmitting}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang lưu...' : 'Lưu sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

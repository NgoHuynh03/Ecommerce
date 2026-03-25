'use client'

import { useState, useEffect } from 'react'
import { Category } from '@/types'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCategories = () => {
    setLoading(true)
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => {
        if (d.success) setCategories(d.data)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        alert('Đã xóa thành công')
        fetchCategories()
      } else {
        alert(data.error)
      }
    }
  }

  // Build tree
  const buildTree = (cats: Category[], parentId: string | null = null): Category[] => {
    return cats.filter(c => c.parentId === parentId).map(c => ({
      ...c,
      children: buildTree(cats, c.id)
    }))
  }

  const categoryTree = buildTree(categories)

  const renderTree = (nodes: Category[], level = 0) => {
    return nodes.map(node => (
      <div key={node.id} style={{ marginLeft: `${level * 24}px`, borderBottom: '1px solid var(--border-color)', padding: '12px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {level > 0 && <span style={{ color: 'var(--text-muted)' }}>↳</span>}
            <span style={{ fontSize: '24px' }}>{node.image || '📁'}</span>
            <div>
              <div style={{ fontWeight: 600 }}>{node.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{node.slug}</div>
            </div>
            <span className="badge" style={{ marginLeft: '12px' }}>{node._count?.products || 0} sản phẩm</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-icon" onClick={() => alert('Sửa danh mục đang phát triển')} title="Sửa">✏️</button>
            <button className="btn-icon" onClick={() => handleDelete(node.id)} title="Xóa" style={{ color: 'var(--color-danger)' }}>🗑️</button>
          </div>
        </div>
        {(node as any).children && (node as any).children.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            {renderTree((node as any).children, level + 1)}
          </div>
        )}
      </div>
    ))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Quản lý Danh mục</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{categories.length} danh mục</p>
        </div>
        <button className="btn btn-primary" onClick={() => alert('Thêm danh mục đang được phát triển')}>+ Thêm danh mục</button>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="loading-spinner" style={{ margin: '40px auto' }}></div>
          ) : categories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Chưa có danh mục nào</div>
          ) : (
            <div>
              {renderTree(categoryTree)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

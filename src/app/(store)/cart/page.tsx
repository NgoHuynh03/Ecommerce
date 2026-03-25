'use client'

import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import styles from './cart.module.css'

export default function CartPage() {
  const { items, itemCount, totalAmount, updateQuantity, removeFromCart, loading } = useCart()
  const { user } = useAuth()
  const shippingFee = totalAmount >= 500000 ? 0 : 30000

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '60px 0' }}>
        <div className="empty-state">
          <span style={{ fontSize: '64px' }}>🛒</span>
          <h3>Giỏ hàng trống</h3>
          <p>Bạn chưa thêm sản phẩm nào vào giỏ hàng</p>
          <Link href="/products" className="btn btn-primary btn-lg">Mua sắm ngay</Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.cartPage}>
      <div className="container">
        <h1 className={styles.pageTitle}>Giỏ hàng ({itemCount} sản phẩm)</h1>
        <div className={styles.layout}>
          <div className={styles.cartItems}>
            {items.map(item => {
              const price = item.product.salePrice || item.product.price
              const imageUrl = item.product.images?.[0]?.url || 'https://placehold.co/100x100/e2e8f0/94a3b8?text=SP'
              return (
                <div key={item.id} className={styles.cartItem}>
                  <Link href={`/products/${item.product.slug}`} className={styles.itemImage}>
                    <img src={imageUrl} alt={item.product.name} />
                  </Link>
                  <div className={styles.itemInfo}>
                    <Link href={`/products/${item.product.slug}`}><h3>{item.product.name}</h3></Link>
                    <p className={styles.itemPrice}>{formatCurrency(price)}</p>
                    <div className={styles.quantityControl}>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} disabled={loading}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} disabled={loading}>+</button>
                    </div>
                  </div>
                  <div className={styles.itemRight}>
                    <p className={styles.itemTotal}>{formatCurrency(price * item.quantity)}</p>
                    <button onClick={() => removeFromCart(item.product.id)} className={styles.removeBtn} disabled={loading}>🗑️ Xóa</button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className={styles.summary}>
            <div className={styles.summaryCard}>
              <h3>Tóm tắt đơn hàng</h3>
              <div className={styles.summaryRow}><span>Tạm tính</span><span>{formatCurrency(totalAmount)}</span></div>
              <div className={styles.summaryRow}><span>Phí vận chuyển</span><span>{shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}</span></div>
              {shippingFee > 0 && <p className={styles.freeShipNote}>🚚 Mua thêm {formatCurrency(500000 - totalAmount)} để được miễn phí vận chuyển</p>}
              <div className={`${styles.summaryRow} ${styles.total}`}><span>Tổng cộng</span><span>{formatCurrency(totalAmount + shippingFee)}</span></div>
              {user ? (
                <Link href="/checkout" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '16px' }}>Thanh toán →</Link>
              ) : (
                <Link href="/login" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '16px' }}>Đăng nhập để thanh toán</Link>
              )}
              <Link href="/products" className="btn btn-secondary" style={{ width: '100%', marginTop: '8px' }}>← Tiếp tục mua sắm</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

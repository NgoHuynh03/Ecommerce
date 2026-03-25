import Link from 'next/link'
import styles from './StoreFooter.module.css'

export default function StoreFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div className="container">
          <div className={styles.footerGrid}>
            <div className={styles.footerCol}>
              <Link href="/" className={styles.footerLogo}>
                <span>🛒</span> Shop<span className={styles.accent}>VN</span>
              </Link>
              <p className={styles.footerDesc}>
                Website thương mại điện tử hàng đầu Việt Nam. Mua sắm trực tuyến hàng triệu sản phẩm chính hãng với giá tốt nhất.
              </p>
              <div className={styles.socialLinks}>
                <a href="#" aria-label="Facebook">📘</a>
                <a href="#" aria-label="YouTube">📺</a>
                <a href="#" aria-label="Instagram">📸</a>
                <a href="#" aria-label="TikTok">🎵</a>
              </div>
            </div>
            <div className={styles.footerCol}>
              <h4>Hỗ trợ khách hàng</h4>
              <ul>
                <li><Link href="#">Trung tâm trợ giúp</Link></li>
                <li><Link href="#">Hướng dẫn mua hàng</Link></li>
                <li><Link href="#">Chính sách đổi trả</Link></li>
                <li><Link href="#">Chính sách bảo hành</Link></li>
                <li><Link href="#">Chính sách vận chuyển</Link></li>
              </ul>
            </div>
            <div className={styles.footerCol}>
              <h4>Về ShopVN</h4>
              <ul>
                <li><Link href="#">Giới thiệu</Link></li>
                <li><Link href="#">Tuyển dụng</Link></li>
                <li><Link href="#">Điều khoản sử dụng</Link></li>
                <li><Link href="#">Chính sách bảo mật</Link></li>
                <li><Link href="#">Liên hệ</Link></li>
              </ul>
            </div>
            <div className={styles.footerCol}>
              <h4>Liên hệ</h4>
              <ul className={styles.contactList}>
                <li>📍 Hà Nội</li>
                <li>📞 1900 1234 56</li>
                <li>✉️ support@shopvn.vn</li>
                <li>🕐 08:00 - 22:00 hàng ngày</li>
              </ul>
              <h4 style={{ marginTop: '16px' }}>Thanh toán</h4>
              <div className={styles.paymentMethods}>
                <span>💳 VISA</span>
                <span>💳 MasterCard</span>
                <span>🏦 ATM</span>
                <span>💵 COD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <div className="container">
          <p>© 2024 ShopVN. Tất cả quyền được bảo lưu. Giấy phép kinh doanh số 0123456789.</p>
        </div>
      </div>
    </footer>
  )
}

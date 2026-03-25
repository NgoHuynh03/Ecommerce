import StoreHeader from '@/components/store/StoreHeader'
import StoreFooter from '@/components/store/StoreFooter'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StoreHeader />
      <main style={{ minHeight: 'calc(100vh - var(--header-height))' }}>{children}</main>
      <StoreFooter />
    </>
  )
}

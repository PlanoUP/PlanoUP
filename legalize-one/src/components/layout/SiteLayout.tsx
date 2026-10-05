import { Outlet } from 'react-router'
import { Footer } from './Footer'
import { Header } from './Header'
import { MobileStickyCTA } from './MobileStickyCTA'
import { PageViewTracker } from './PageViewTracker'
import { PreviewBanner } from './PreviewBanner'
import { ScrollManager } from './ScrollManager'

export function SiteLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <ScrollManager />
      <PageViewTracker />
      <PreviewBanner />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileStickyCTA />
    </div>
  )
}

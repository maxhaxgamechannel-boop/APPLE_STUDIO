import { Suspense } from 'react'
import { lazyRetry } from '@/lib/lazy'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, MotionConfig } from 'framer-motion'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { CartDrawer } from './components/layout/CartDrawer'
import { SearchOverlay } from './components/layout/SearchOverlay'
import { FlyingLayer } from './components/layout/FlyingLayer'
import { Splash } from './components/layout/Splash'
import { PageLoader, PageTransition } from './components/layout/PageTransition'
import { useWebGL } from './hooks/useWebGL'
import { ErrorBoundary, PageError } from './components/ErrorBoundary'
import Home from './pages/Home'

// Страницы загружаются лениво — главная открывается быстрее
const Catalog = lazyRetry(() => import('./pages/Catalog'), 'Catalog')
const ProductPage = lazyRetry(() => import('./pages/Product'), 'ProductPage')
const Checkout = lazyRetry(() => import('./pages/Checkout'), 'Checkout')
const Success = lazyRetry(() => import('./pages/Success'), 'Success')
const About = lazyRetry(() => import('./pages/About'), 'About')
const Contacts = lazyRetry(() => import('./pages/Contacts'), 'Contacts')
const Delivery = lazyRetry(() => import('./pages/Delivery'), 'Delivery')
const Warranty = lazyRetry(() => import('./pages/Warranty'), 'Warranty')
const Faq = lazyRetry(() => import('./pages/Faq'), 'Faq')
const NotFound = lazyRetry(() => import('./pages/NotFound'), 'NotFound')
const ViewCanvas = lazyRetry(() => import('./three/ViewCanvas'), 'ViewCanvas')

/** Новая страница открывается сверху — после того как старая доиграла анимацию ухода */
const scrollTop = () => window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })

// Каждая страница изолирована: сбой одной не оставит сайт пустым экраном
const page = (el: React.ReactNode) => (
  <PageTransition>
    <ErrorBoundary fallback={(reset) => <PageError onRetry={reset} />}>
      <Suspense fallback={<PageLoader />}>{el}</Suspense>
    </ErrorBoundary>
  </PageTransition>
)

export default function App() {
  const location = useLocation()
  const webgl = useWebGL()

  return (
    <MotionConfig reducedMotion="user">
      <Splash />
      <Navbar />
      <AnimatePresence mode="wait" onExitComplete={scrollTop}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={page(<Home />)} />
          <Route path="/catalog" element={page(<Catalog />)} />
          <Route path="/catalog/:category" element={page(<Catalog />)} />
          <Route path="/product/:slug" element={page(<ProductPage />)} />
          <Route path="/checkout" element={page(<Checkout />)} />
          <Route path="/success" element={page(<Success />)} />
          <Route path="/about" element={page(<About />)} />
          <Route path="/contacts" element={page(<Contacts />)} />
          <Route path="/delivery" element={page(<Delivery />)} />
          <Route path="/warranty" element={page(<Warranty />)} />
          <Route path="/faq" element={page(<Faq />)} />
          <Route path="*" element={page(<NotFound />)} />
        </Routes>
      </AnimatePresence>
      <Footer />
      <CartDrawer />
      <SearchOverlay />
      <FlyingLayer />
      {webgl && (
        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <ViewCanvas />
          </Suspense>
        </ErrorBoundary>
      )}
    </MotionConfig>
  )
}

import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth.jsx'
import { ProtectedLayout } from './ui.jsx'

const LoginPage = lazy(() => import('./pages/AuthPages.jsx').then((module) => ({ default: module.LoginPage })))
const RegisterPage = lazy(() => import('./pages/AuthPages.jsx').then((module) => ({ default: module.RegisterPage })))
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'))
const PublicationsPage = lazy(() => import('./pages/PublicationsPage.jsx'))
const CampaignsPage = lazy(() => import('./pages/CampaignsPage.jsx'))
const ConversionPage = lazy(() => import('./pages/AnalyticsPages.jsx').then((module) => ({ default: module.ConversionPage })))
const IntelligencePage = lazy(() => import('./pages/AnalyticsPages.jsx').then((module) => ({ default: module.IntelligencePage })))
const ReportsPage = lazy(() => import('./pages/AnalyticsPages.jsx').then((module) => ({ default: module.ReportsPage })))
const AssistantPage = lazy(() => import('./pages/AssistantPage.jsx'))
const PresentationPage = lazy(() => import('./pages/PresentationPage.jsx'))

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="full-loading"><span className="spinner" /><span>Verificando sessão...</span></div>
  return user ? children : <Navigate to="/login" replace />
}

function Guest({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="full-loading"><span className="spinner" /><span>Verificando sessão...</span></div>
  return user ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <Suspense fallback={<div className="full-loading"><span className="spinner" /><span>Carregando interface...</span></div>}>
      <Routes>
        <Route path="/login" element={<Guest><LoginPage /></Guest>} />
        <Route path="/register" element={<Guest><RegisterPage /></Guest>} />
        <Route element={<Protected><ProtectedLayout /></Protected>}>
          <Route index element={<DashboardPage />} />
          <Route path="publications" element={<PublicationsPage />} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="conversion" element={<ConversionPage />} />
          <Route path="intelligence" element={<IntelligencePage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="assistant" element={<AssistantPage />} />
          <Route path="presentation" element={<PresentationPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

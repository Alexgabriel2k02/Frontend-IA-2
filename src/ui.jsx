import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Activity, BarChart3, ChevronDown, ChevronRight, Download, FileText,
  LayoutDashboard, Lightbulb, LogOut, Menu, Megaphone, Users, X,
} from 'lucide-react'
import { useAuth } from './auth.jsx'

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/publications', label: 'Publicações', icon: FileText },
  { to: '/campaigns', label: 'Campanhas', icon: Megaphone },
  { to: '/conversion', label: 'Conversão', icon: Activity },
  { to: '/intelligence', label: 'Inteligência', icon: Lightbulb },
  { to: '/reports', label: 'Relatórios', icon: BarChart3 },
]

const titles = {
  '/': ['Visão geral', 'Acompanhe o desempenho das suas campanhas.'],
  '/publications': ['Publicações', 'Pesquise e analise os conteúdos publicados.'],
  '/campaigns': ['Campanhas', 'Organize campanhas e seus conteúdos.'],
  '/conversion': ['Conversão', 'Entenda o percurso entre as etapas do funil.'],
  '/intelligence': ['Inteligência', 'Insights descritivos com base nos dados registrados.'],
  '/reports': ['Relatórios', 'Exporte os dados de publicações da sua conta.'],
}

export function ProtectedLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [title, subtitle] = titles[location.pathname] || ['Nexora AI', 'Analytics']

  return (
    <div className="app-shell">
      {open && <button className="sidebar-backdrop" aria-label="Fechar menu" onClick={() => setOpen(false)} />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark">N</div>
          <div className="brand-name">Nexora <span>AI</span><small>ANALYTICS</small></div>
          <button className="icon-button mobile-close" onClick={() => setOpen(false)} aria-label="Fechar menu"><X size={19} /></button>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Navegação principal">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>{label === 'Dashboard' && <ChevronRight className="nav-chevron" size={15} />}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-status"><span className="status-dot" /> API conectada via configuração</div>
          <button className="account-card" onClick={() => setProfileOpen((value) => !value)}>
            <div className="avatar">{(user?.name || 'A').slice(0, 1).toUpperCase()}</div>
            <div className="account-copy"><strong>{user?.name || 'Analista'}</strong><span>{user?.role || 'Analista'}</span></div>
            <ChevronDown size={16} />
          </button>
          {profileOpen && <button className="logout-menu" onClick={logout}><LogOut size={16} /> Sair da conta</button>}
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setOpen(true)} aria-label="Abrir menu"><Menu size={20} /></button>
          <div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14} /><strong>{title}</strong></div>
          <div className="topbar-right">
            <div className="topbar-user">
              <div className="avatar avatar-small">{(user?.name || 'A').slice(0, 1).toUpperCase()}</div>
              <span>{user?.name || 'Analista'}</span>
            </div>
          </div>
        </header>
        <main className="page-content">
          <div className="page-heading"><div><p className="eyebrow">NEXORA ANALYTICS</p><h1>{title}</h1><p className="page-subtitle">{subtitle}</p></div></div>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function PageState({ loading, error, empty, children, emptyText = 'Nenhum dado disponível.' }) {
  if (loading) return <div className="state-card"><span className="spinner" /><span>Carregando dados...</span></div>
  if (error) return <div className="state-card state-error"><strong>Não foi possível carregar os dados</strong><span>{error}</span></div>
  if (empty) return <div className="state-card state-empty"><span className="empty-icon"><Download size={20} /></span><strong>{emptyText}</strong></div>
  return children
}

export function Notice({ children, tone = 'info' }) {
  return <div className={`notice notice-${tone}`}>{children}</div>
}

export function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-heading"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Fechar"><X size={19} /></button></div>
        {children}
      </section>
    </div>
  )
}

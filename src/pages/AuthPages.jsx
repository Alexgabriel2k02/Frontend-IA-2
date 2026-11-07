import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, BarChart3, Eye, EyeOff, LockKeyhole, Mail, Sparkles, UserRound } from 'lucide-react'
import { useAuth } from '../auth.jsx'

function AuthFrame({ children, eyebrow, title, description }) {
  return (
    <main className="auth-page">
      <div className="auth-decoration"><div className="auth-orb auth-orb-one" /><div className="auth-orb auth-orb-two" /></div>
      <section className="auth-brand-panel">
        <div className="brand-lockup auth-brand"><div className="brand-mark">N</div><div className="brand-name">Nexora <span>AI</span><small>ANALYTICS</small></div></div>
        <div className="auth-brand-content">
          <div className="auth-icon"><BarChart3 size={23} /></div>
          <p>ANALYTICS · PERFORMANCE · CLAREZA</p>
          <h2>Dados que ajudam<br />a decidir melhor.</h2>
          <span>Acompanhe campanhas e publicações com os dados do seu workspace.</span>
        </div>
        <div className="auth-footer"><span>© Nexora AI</span><span>Analytics workspace</span></div>
      </section>
      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand"><span className="brand-mark">N</span><strong>Nexora <i>AI</i></strong></div>
          <p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="auth-description">{description}</p>
          {children}
        </div>
      </section>
    </main>
  )
}

function PasswordInput({ value, onChange, autoComplete = 'current-password' }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="input-with-icon">
      <LockKeyhole size={17} />
      <input type={visible ? 'text' : 'password'} value={value} onChange={onChange} autoComplete={autoComplete} required minLength={8} placeholder="Mínimo de 8 caracteres" />
      <button className="password-toggle" type="button" onClick={() => setVisible((current) => !current)} aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button>
    </div>
  )
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login({ email: email.trim(), password })
      navigate('/', { replace: true })
    } catch (issue) {
      setError(issue.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthFrame eyebrow="BEM-VINDA DE VOLTA" title="Acesse seu workspace" description="Entre com suas credenciais para continuar.">
      <form className="auth-form" onSubmit={submit}>
        {error && <div className="form-alert" role="alert">{error}</div>}
        <label className="form-label">E-mail<div className="input-with-icon"><Mail size={17} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required placeholder="voce@empresa.com" /></div></label>
        <label className="form-label">Senha<PasswordInput value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        <button className="button button-primary auth-submit" disabled={busy}>{busy ? 'Entrando...' : 'Entrar'}{!busy && <ArrowRight size={17} />}</button>
      </form>
      <p className="auth-switch">Ainda não tem uma conta? <Link to="/register">Criar conta <ArrowRight size={14} /></Link></p>
      <div className="auth-secure"><LockKeyhole size={14} /> Acesso seguro ao seu workspace</div>
    </AuthFrame>
  )
}

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await register({ name: name.trim(), email: email.trim(), password })
      navigate('/', { replace: true })
    } catch (issue) {
      setError(issue.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthFrame eyebrow="NOVO WORKSPACE" title="Crie sua conta" description="Cadastre-se para acompanhar suas análises.">
      <form className="auth-form" onSubmit={submit}>
        {error && <div className="form-alert" role="alert">{error}</div>}
        <label className="form-label">Nome completo<div className="input-with-icon"><UserRound size={17} /><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required maxLength={120} placeholder="Seu nome" /></div></label>
        <label className="form-label">E-mail<div className="input-with-icon"><Mail size={17} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required placeholder="voce@empresa.com" /></div></label>
        <label className="form-label">Senha<PasswordInput value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" /></label>
        <p className="form-hint"><Sparkles size={14} /> Use ao menos 8 caracteres.</p>
        <button className="button button-primary auth-submit" disabled={busy}>{busy ? 'Criando conta...' : 'Criar conta'}{!busy && <ArrowRight size={17} />}</button>
      </form>
      <p className="auth-switch">Já tem uma conta? <Link to="/login">Entrar <ArrowRight size={14} /></Link></p>
      <div className="auth-secure"><LockKeyhole size={14} /> Cadastro de analista</div>
    </AuthFrame>
  )
}

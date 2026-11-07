import { useEffect, useState } from 'react'
import { Activity, ArrowUpRight, Eye, FileText, Heart, MousePointer2, Share2, UserCheck, UserPlus, Users, Download } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api } from '../api.js'
import { Notice, PageState } from '../ui.jsx'

const cards = [
  ['publications', 'Publicações', FileText, 'neutral'],
  ['views', 'Visualizações', Eye, 'blue'],
  ['likes', 'Curtidas', Heart, 'rose'],
  ['shares', 'Compartilhamentos', Share2, 'violet'],
  ['clicks', 'Cliques', MousePointer2, 'cyan'],
  ['downloads', 'Downloads', Download, 'green'],
  ['signups', 'Cadastros', UserPlus, 'orange'],
  ['active_users', 'Usuários ativos', UserCheck, 'blue'],
]

const number = (value) => new Intl.NumberFormat('pt-BR').format(value ?? 0)
const monthLabel = (month) => {
  const [year, value] = (month || '').split('-')
  if (!year || !value) return month
  return new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(Number(year), Number(value) - 1))
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.dashboard().then(setData).catch((issue) => setError(issue.message)).finally(() => setLoading(false))
  }, [])

  const monthly = (data?.monthly || []).map((item) => ({ ...item, label: monthLabel(item.month) }))
  const hasTotals = data?.totals && Object.values(data.totals).some((value) => Number(value) > 0)

  return (
    <PageState loading={loading} error={error}>
      {!hasTotals && monthly.length === 0 ? <Notice>O dashboard ainda não tem publicações ou métricas para exibir. Os dados aparecerão quando existirem registros na API.</Notice> : (
        <div className="dashboard-content">
          <div className="metric-grid">
            {cards.map(([key, label, Icon, tone]) => (
              <article className="metric-card" key={key}>
                <div className={`metric-icon tone-${tone}`}><Icon size={18} /></div>
                <span className="metric-label">{label}</span>
                <strong className="metric-value">{number(data?.totals?.[key])}</strong>
                <span className="metric-caption">Total registrado</span>
              </article>
            ))}
          </div>
          <section className="panel chart-panel">
            <div className="panel-heading"><div><h2>Desempenho mensal</h2><p>Totais agrupados pelo mês de publicação.</p></div><div className="chart-legend"><span><i className="legend-dot legend-views" />Visualizações</span><span><i className="legend-dot legend-clicks" />Cliques</span><span><i className="legend-dot legend-downloads" />Downloads</span></div></div>
            {monthly.length ? <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><LineChart data={monthly} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#edf1f5" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#8a97a8', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8a97a8', fontSize: 11 }} tickFormatter={(value) => number(value)} />
              <Tooltip formatter={(value, name) => [number(value), ({ views: 'Visualizações', clicks: 'Cliques', downloads: 'Downloads' })[name] || name]} labelFormatter={(_, payload) => payload?.[0]?.payload?.month || ''} contentStyle={{ borderRadius: 12, borderColor: '#e8edf2', boxShadow: '0 8px 24px #172b4d12' }} />
              <Line type="monotone" dataKey="views" name="views" stroke="#1b78cb" strokeWidth={2.5} dot={{ r: 3, fill: '#1b78cb' }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="clicks" name="clicks" stroke="#21b8c5" strokeWidth={2.5} dot={{ r: 3, fill: '#21b8c5' }} />
              <Line type="monotone" dataKey="downloads" name="downloads" stroke="#61b47d" strokeWidth={2.5} dot={{ r: 3, fill: '#61b47d' }} />
            </LineChart></ResponsiveContainer></div> : <div className="chart-empty"><Activity size={21} /><span>A API não retornou uma série mensal.</span></div>}
            <div className="chart-footnote"><ArrowUpRight size={14} /> A série apresenta os totais registrados, não uma evolução histórica por snapshot.</div>
          </section>
          <div className="dashboard-bottom">
            <section className="panel summary-panel"><div className="section-title"><span className="panel-icon"><Users size={17} /></span><div><h2>Resumo da conta</h2><p>Registros disponíveis no seu workspace</p></div></div><div className="summary-row"><span>Campanhas</span><strong>{number(data?.totals?.campaigns)}</strong></div><div className="summary-row"><span>Publicações</span><strong>{number(data?.totals?.publications)}</strong></div></section>
            <section className="panel summary-panel"><div className="section-title"><span className="panel-icon panel-icon-cyan"><Activity size={17} /></span><div><h2>Métricas registradas</h2><p>Agregados retornados pelo backend</p></div></div><div className="summary-row"><span>Comentários</span><strong>{number(data?.totals?.comments)}</strong></div><div className="summary-row"><span>Interações informadas</span><strong>{number((data?.totals?.likes || 0) + (data?.totals?.comments || 0) + (data?.totals?.shares || 0))}</strong></div></section>
          </div>
        </div>
      )}
    </PageState>
  )
}

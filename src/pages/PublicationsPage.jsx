import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, FileText, Search, SlidersHorizontal } from 'lucide-react'
import { api } from '../api.js'
import { Notice, PageState } from '../ui.jsx'

const formatNames = { reels: 'Reels', carousel: 'Carrossel', image: 'Imagem' }
const dateLabel = (value) => value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(value)) : '—'
const count = (value) => new Intl.NumberFormat('pt-BR').format(value || 0)

export default function PublicationsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [format, setFormat] = useState('')
  const [theme, setTheme] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    api.publications({ format, theme, start_date: startDate, end_date: endDate })
      .then(setItems).catch((issue) => setError(issue.message)).finally(() => setLoading(false))
  }, [format, theme, startDate, endDate])

  const themes = useMemo(() => [...new Set(items.map((item) => item.theme).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [items])
  const filtered = items.filter((item) => `${item.title} ${item.campaign_name} ${item.theme} ${item.format}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')))

  return (
    <>
      <section className="panel table-panel">
        <div className="table-toolbar">
          <div className="toolbar-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar publicações..." aria-label="Buscar publicações" /></div>
          <div className="filter-toolbar">
            <label className="filter-select"><SlidersHorizontal size={15} /><select value={format} onChange={(event) => setFormat(event.target.value)} aria-label="Filtrar por formato"><option value="">Todos os formatos</option>{Object.entries(formatNames).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
            <label className="filter-select"><select value={theme} onChange={(event) => setTheme(event.target.value)} aria-label="Filtrar por tema"><option value="">Todos os temas</option>{themes.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
          </div>
        </div>
        <div className="date-filter-row">
          <span><CalendarDays size={15} /> Período</span>
          <label>De <input type="date" value={startDate} max={endDate || undefined} onChange={(event) => setStartDate(event.target.value)} /></label>
          <label>Até <input type="date" value={endDate} min={startDate || undefined} onChange={(event) => setEndDate(event.target.value)} /></label>
          {(format || theme || startDate || endDate || search) && <button className="text-button" onClick={() => { setFormat(''); setTheme(''); setStartDate(''); setEndDate(''); setSearch('') }}>Limpar filtros</button>}
        </div>
        <PageState loading={loading} error={error} empty={!filtered.length} emptyText={items.length ? 'Nenhuma publicação corresponde à busca.' : 'Nenhuma publicação encontrada para estes filtros.'}>
          <div className="table-scroll"><table className="data-table"><thead><tr><th>PUBLICAÇÃO</th><th>CAMPANHA</th><th>DATA</th><th>TEMA</th><th>FORMATO</th><th>VISUALIZAÇÕES</th><th>CURTIDAS</th><th>COMPART.</th><th>CLIQUES</th><th>DOWNLOADS</th><th>CADASTROS</th><th>USUÁRIOS ATIVOS</th></tr></thead><tbody>
            {filtered.map((item) => <tr key={item.publication_id}><td><div className="publication-title"><span className="table-icon"><FileText size={15} /></span><strong>{item.title}</strong></div></td><td>{item.campaign_name || '—'}{item.is_simulated && <span className="simulated-tag">Simulada</span>}</td><td className="nowrap">{dateLabel(item.published_at)}</td><td><span className="theme-tag">{item.theme}</span></td><td><span className="format-tag">{formatNames[item.format] || item.format}</span></td><td>{count(item.views)}</td><td>{count(item.likes)}</td><td>{count(item.shares)}</td><td>{count(item.clicks)}</td><td>{count(item.downloads)}</td><td>{count(item.signups)}</td><td>{count(item.active_users)}</td></tr>)}
          </tbody></table></div>
          <div className="table-footer"><span>{filtered.length} {filtered.length === 1 ? 'publicação' : 'publicações'}</span><span>Dados fornecidos pela API</span></div>
        </PageState>
      </section>
      <Notice>Para criar ou editar publicações e atualizar suas métricas, acesse a campanha correspondente.</Notice>
    </>
  )
}

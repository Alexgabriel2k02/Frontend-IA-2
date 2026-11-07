import { useEffect, useState } from 'react'
import { Activity, ArrowDown, ArrowRight, BarChart3, CheckCircle2, Download, FileDown, Info, Lightbulb, ShieldAlert, Sparkles } from 'lucide-react'
import { api } from '../api.js'
import { Notice, PageState } from '../ui.jsx'

const number = (value) => new Intl.NumberFormat('pt-BR').format(value ?? 0)
const percent = (fraction) => fraction == null ? '—' : `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(fraction * 100)}%`
const stageLabels = { views: 'Visualizações', clicks: 'Cliques', downloads: 'Downloads', signups: 'Cadastros', active_users: 'Usuários ativos' }
const groupLabels = { campaign: 'Campanha', format: 'Formato', theme: 'Tema' }
const formatLabel = (value) => ({ reels: 'Reels', carousel: 'Carrossel', image: 'Imagem' })[value] || value

export function ConversionPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { api.conversion().then(setData).catch((issue) => setError(issue.message)).finally(() => setLoading(false)) }, [])
  const stages = data?.stages || []

  return (
    <PageState loading={loading} error={error} empty={!stages.length} emptyText="A API não retornou etapas do funil.">
      <section className="panel funnel-panel">
        <div className="panel-heading"><div><h2>Funil de conversão</h2><p>Totais e taxas entre as etapas informadas pela API.</p></div><span className="panel-icon panel-icon-cyan"><Activity size={18} /></span></div>
        <div className="funnel-list">
          {stages.map((stage, index) => <div className="funnel-step-wrap" key={stage.name}>
            {index > 0 && <div className="funnel-rate"><span className="funnel-connector" /><span className="rate-badge"><ArrowDown size={13} /> {percent(stage.conversion_from_previous)}</span></div>}
            <article className={`funnel-stage funnel-stage-${index}`}>
              <div className="stage-index">{String(index + 1).padStart(2, '0')}</div>
              <div className="stage-main"><span className="stage-label">{stageLabels[stage.name] || stage.name}</span><strong>{number(stage.count)}</strong><span className="stage-subtitle">{index === 0 ? 'Etapa inicial' : 'registros'}</span></div>
              {index > 0 && <div className="stage-conversion"><span>Conversão da etapa anterior</span><strong>{percent(stage.conversion_from_previous)}</strong></div>}
            </article>
          </div>)}
        </div>
        {data?.note && <div className="notice notice-info funnel-note"><Info size={16} /><span>{data.note}</span></div>}
        <p className="small-muted">Taxas nulas ou sem denominador são exibidas como “—”.</p>
      </section>
    </PageState>
  )
}

export function IntelligencePage() {
  const [recommendations, setRecommendations] = useState(null)
  const [breakdown, setBreakdown] = useState([])
  const [loading, setLoading] = useState(true)
  const [breakdownLoading, setBreakdownLoading] = useState(true)
  const [error, setError] = useState('')
  const [breakdownError, setBreakdownError] = useState('')
  const [by, setBy] = useState('campaign')

  useEffect(() => {
    api.recommendations().then(setRecommendations).catch((issue) => setError(issue.message)).finally(() => setLoading(false))
  }, [])
  useEffect(() => {
    setBreakdownLoading(true)
    setBreakdownError('')
    api.breakdown(by).then(setBreakdown).catch((issue) => setBreakdownError(issue.message)).finally(() => setBreakdownLoading(false))
  }, [by])

  const cards = recommendations?.recommendations || []
  const columns = by === 'campaign'
    ? [['campaign_name', 'Campanha'], ['publications', 'Publicações']]
    : [[by, groupLabels[by]], ['publications', 'Publicações']]
  columns.push(['views', 'Visualizações'], ['downloads', 'Downloads'], ['download_rate', 'Taxa de downloads'], ['engagement_rate', 'Taxa de interação'])

  return (
    <div className="intelligence-content">
      <section className="panel recommendations-panel">
        <div className="panel-heading"><div className="heading-with-icon"><span className="recommendation-icon"><Sparkles size={18} /></span><div><h2>Recomendações</h2><p>Observações calculadas sobre os dados disponíveis.</p></div></div><span className={`status-pill ${recommendations?.status === 'available' ? 'status-active' : 'status-planned'}`}>{recommendations?.status === 'available' ? 'Disponíveis' : recommendations?.status === 'insufficient_data' ? 'Amostra insuficiente' : 'Status da API'}</span></div>
        <PageState loading={loading} error={error} empty={!cards.length} emptyText={recommendations?.status === 'insufficient_data' ? 'A API sinalizou dados insuficientes para recomendações.' : 'Nenhuma recomendação foi retornada pela API.'}>
          <div className="recommendation-grid">{cards.map((item, index) => <article className="recommendation-card" key={`${item.type}-${index}`}>
            <span className="recommendation-type"><Lightbulb size={14} /> {item.type?.replaceAll('_', ' ')}</span>
            <p>{item.message}</p>
            {item.evidence && <div className="evidence-grid">{Object.entries(item.evidence).map(([key, value]) => <div className="evidence-item" key={key}><span>{({ format: 'Formato', theme: 'Tema', publications: 'Publicações', views: 'Visualizações', downloads: 'Downloads', download_rate: 'Taxa de downloads' })[key] || key}</span><strong>{key === 'format' ? formatLabel(value) : key === 'download_rate' ? percent(value) : typeof value === 'number' ? number(value) : value}</strong></div>)}</div>}
          </article>)}</div>
        </PageState>
        {recommendations?.note && <div className="notice notice-info"><Info size={16} /><span>{recommendations.note}</span></div>}
        <div className="notice notice-warn"><ShieldAlert size={16} /><span>As recomendações são descritivas. Associação ou correlação observada não demonstra causalidade.</span></div>
      </section>
      <section className="panel breakdown-panel">
        <div className="panel-heading breakdown-heading"><div><h2>Comparações</h2><p>Agregados retornados pelo endpoint de análise.</p></div><label className="filter-select"><BarChart3 size={15} /><select value={by} onChange={(event) => setBy(event.target.value)} aria-label="Agrupar comparação">{Object.entries(groupLabels).map(([key, label]) => <option value={key} key={key}>Por {label.toLocaleLowerCase('pt-BR')}</option>)}</select></label></div>
        <PageState loading={breakdownLoading} error={breakdownError} empty={!breakdown.length} emptyText="Nenhuma comparação disponível para este agrupamento.">
          <div className="table-scroll"><table className="data-table comparison-table"><thead><tr>{columns.map(([key, label]) => <th key={key}>{label.toUpperCase()}</th>)}</tr></thead><tbody>
            {breakdown.map((row, index) => <tr key={`${row[by] || row.campaign_id || index}-${index}`}>{columns.map(([key]) => <td key={key}>{key.endsWith('_rate') ? percent(row[key]) : key === 'format' ? formatLabel(row[key]) : key === 'campaign_name' ? <strong>{row[key]}</strong> : numberOrText(row[key])}</td>)}</tr>)}
          </tbody></table></div>
          <div className="table-footer"><span>{breakdown.length} {breakdown.length === 1 ? 'grupo' : 'grupos'}</span><span>Sem classificação causal</span></div>
        </PageState>
      </section>
    </div>
  )
}

function numberOrText(value) {
  return typeof value === 'number' ? number(value) : value ?? '—'
}

export function ReportsPage() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function download() {
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      const blob = await api.downloadCsv()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'nexora-publicacoes.csv'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setSuccess('O download do relatório foi iniciado.')
    } catch (issue) { setError(issue.message) }
    finally { setBusy(false) }
  }

  return (
    <div className="reports-layout">
      <section className="panel report-card">
        <div className="report-icon"><FileDown size={23} /></div>
        <div className="report-copy"><span className="eyebrow">EXPORTAÇÃO CSV</span><h2>Relatório de publicações</h2><p>Baixe o arquivo autenticado com as publicações e os totais de métricas e conversões retornados pelo backend.</p></div>
        <div className="report-divider" />
        <div className="report-details"><div><CheckCircle2 size={16} /><span>Exportação segura com seu JWT</span></div><div><CheckCircle2 size={16} /><span>Arquivo CSV para análise</span></div><div><CheckCircle2 size={16} /><span>Dados da sua conta</span></div></div>
        {error && <div className="form-alert" role="alert">{error}</div>}
        {success && <div className="success-alert" role="status">{success}</div>}
        <button className="button button-primary report-download" onClick={download} disabled={busy}><Download size={17} />{busy ? 'Preparando arquivo...' : 'Baixar CSV'}</button>
      </section>
      <Notice><Info size={16} /> O relatório contém os registros disponíveis na API no momento da solicitação. Se a conta não possuir publicações, o backend poderá retornar um CSV sem linhas de dados.</Notice>
    </div>
  )
}

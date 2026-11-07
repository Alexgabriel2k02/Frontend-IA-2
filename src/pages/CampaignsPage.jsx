import { useEffect, useState } from 'react'
import { CalendarDays, Edit3, Eye, Megaphone, Plus, Search, Trash2 } from 'lucide-react'
import { api } from '../api.js'
import { Modal, Notice, PageState } from '../ui.jsx'

const statuses = { planned: 'Planejada', active: 'Ativa', completed: 'Concluída', paused: 'Pausada' }
const dateLabel = (value) => value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(`${value.slice(0, 10)}T12:00:00`)) : '—'
const number = (value) => new Intl.NumberFormat('pt-BR').format(value || 0)
const formatNames = { reels: 'Reels', carousel: 'Carrossel', image: 'Imagem' }
const blankCampaign = { name: '', description: '', status: 'planned', start_date: '', end_date: '' }
const blankPublication = { title: '', theme: '', format: 'reels', published_at: '', caption: '', link: '' }

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [query, setQuery] = useState('')
  const [editor, setEditor] = useState(null)
  const [selected, setSelected] = useState(null)

  async function loadCampaigns() {
    setError('')
    try { setCampaigns(await api.campaigns()) } catch (issue) { setError(issue.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadCampaigns() }, [])

  async function saveCampaign(event) {
    event.preventDefault()
    setActionError('')
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))
    data.name = data.name.trim()
    data.description = data.description.trim() || null
    try {
      if (editor.id) await api.updateCampaign(editor.id, data)
      else await api.createCampaign(data)
      setEditor(null)
      await loadCampaigns()
    } catch (issue) { setActionError(issue.message) }
  }

  async function removeCampaign(campaign) {
    if (!window.confirm(`Remover a campanha "${campaign.name}" e suas publicações?`)) return
    setActionError('')
    try {
      await api.deleteCampaign(campaign.id)
      if (selected?.id === campaign.id) setSelected(null)
      await loadCampaigns()
    } catch (issue) { setActionError(issue.message) }
  }

  const visible = campaigns.filter((campaign) => `${campaign.name} ${campaign.description || ''}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')))

  return (
    <>
      <div className="campaign-toolbar">
        <div className="toolbar-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar campanhas..." aria-label="Buscar campanhas" /></div>
        <button className="button button-primary" onClick={() => { setActionError(''); setEditor({ ...blankCampaign }) }}><Plus size={17} /> Nova campanha</button>
      </div>
      {actionError && <div className="form-alert inline-alert" role="alert">{actionError}</div>}
      <PageState loading={loading} error={error} empty={!visible.length} emptyText={campaigns.length ? 'Nenhuma campanha corresponde à busca.' : 'Nenhuma campanha cadastrada.'}>
        <div className="campaign-grid">
          {visible.map((campaign) => <article className="campaign-card panel" key={campaign.id}>
            <div className="campaign-card-top"><span className="campaign-symbol"><Megaphone size={18} /></span><span className={`status-pill status-${campaign.status}`}>{statuses[campaign.status] || campaign.status}</span></div>
            <h2>{campaign.name}</h2><p className="campaign-description">{campaign.description || 'Sem descrição informada.'}</p>
            <div className="campaign-dates"><CalendarDays size={15} /><span>{dateLabel(campaign.start_date)} – {dateLabel(campaign.end_date)}</span></div>
            {campaign.is_simulated && <div className="simulated-banner">Dados simulados</div>}
            <div className="campaign-actions">
              <button className="button button-soft" onClick={() => { setSelected(campaign); setActionError('') }}><Eye size={16} /> Publicações</button>
              <button className="icon-button" aria-label={`Editar ${campaign.name}`} onClick={() => { setActionError(''); setEditor({ ...campaign }) }}><Edit3 size={16} /></button>
              <button className="icon-button danger-icon" aria-label={`Remover ${campaign.name}`} onClick={() => removeCampaign(campaign)}><Trash2 size={16} /></button>
            </div>
          </article>)}
        </div>
      </PageState>
      {editor && <Modal title={editor.id ? 'Editar campanha' : 'Nova campanha'} onClose={() => setEditor(null)}>
        <form className="modal-form" onSubmit={saveCampaign}>
          <label className="form-label">Nome da campanha<input name="name" required maxLength={160} defaultValue={editor.name} placeholder="Ex.: Lançamento de produto" /></label>
          <label className="form-label">Descrição<textarea name="description" rows="3" defaultValue={editor.description || ''} placeholder="Descreva o objetivo da campanha" /></label>
          <div className="form-two-col"><label className="form-label">Status<select name="status" defaultValue={editor.status || 'planned'}>{Object.entries(statuses).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label><div /></div>
          <div className="form-two-col"><label className="form-label">Início<input type="date" name="start_date" defaultValue={editor.start_date || ''} /></label><label className="form-label">Fim<input type="date" name="end_date" defaultValue={editor.end_date || ''} /></label></div>
          {actionError && <div className="form-alert" role="alert">{actionError}</div>}
          <div className="modal-actions"><button type="button" className="button button-outline" onClick={() => setEditor(null)}>Cancelar</button><button className="button button-primary">Salvar campanha</button></div>
        </form>
      </Modal>}
      {selected && <CampaignPublications campaign={selected} onClose={() => setSelected(null)} />}
    </>
  )
}

function CampaignPublications({ campaign, onClose }) {
  const [publications, setPublications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [editor, setEditor] = useState(null)
  const [countEditor, setCountEditor] = useState(null)

  async function loadPublications() {
    setError('')
    try { setPublications(await api.campaignPublications(campaign.id)) }
    catch (issue) { setError(issue.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { loadPublications() }, [campaign.id])

  async function savePublication(event) {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget))
    const data = {
      ...values,
      title: values.title.trim(),
      theme: values.theme.trim(),
      published_at: new Date(values.published_at).toISOString(),
      caption: values.caption.trim() || null,
      link: values.link.trim() || null,
    }
    try {
      if (editor.id) await api.updatePublication(editor.id, data)
      else await api.createPublication(campaign.id, data)
      setEditor(null)
      await loadPublications()
    } catch (issue) { setActionError(issue.message) }
  }

  async function removePublication(publication) {
    if (!window.confirm(`Remover a publicação "${publication.title}"?`)) return
    try {
      await api.deletePublication(publication.id)
      await loadPublications()
    } catch (issue) { setActionError(issue.message) }
  }

  return (
    <>
      <Modal title={`Publicações · ${campaign.name}`} onClose={onClose} wide>
        <div className="publications-modal-toolbar">
          {campaign.is_simulated && <span className="simulated-tag">Dados simulados</span>}
          <button className="button button-primary button-small" onClick={() => { setActionError(''); setEditor({ ...blankPublication }) }}><Plus size={15} /> Nova publicação</button>
        </div>
        {actionError && <div className="form-alert inline-alert" role="alert">{actionError}</div>}
        <PageState loading={loading} error={error} empty={!publications.length} emptyText="Esta campanha ainda não tem publicações.">
          <div className="table-scroll publication-manager-scroll"><table className="data-table compact-table"><thead><tr><th>PUBLICAÇÃO</th><th>DATA</th><th>TEMA · FORMATO</th><th>VISUALIZAÇÕES</th><th>CLIQUES</th><th>DOWNLOADS</th><th>AÇÕES</th></tr></thead><tbody>
            {publications.map((publication) => <tr key={publication.id}>
              <td><strong>{publication.title}</strong></td><td className="nowrap">{dateLabel(publication.published_at)}</td><td>{publication.theme} · {formatNames[publication.format] || publication.format}</td>
              <td>{number(publication.metrics?.views)}</td><td>{number(publication.metrics?.clicks)}</td><td>{number(publication.conversions?.downloads)}</td>
              <td><div className="row-actions"><button className="icon-button" aria-label={`Editar ${publication.title}`} onClick={() => { setActionError(''); setEditor({ ...publication, published_at: localDateTime(publication.published_at) }) }}><Edit3 size={15} /></button><button className="text-button" onClick={() => setCountEditor({ ...publication, kind: 'metrics' })}>Métricas</button><button className="text-button" onClick={() => setCountEditor({ ...publication, kind: 'conversions' })}>Conversões</button><button className="icon-button danger-icon" aria-label={`Remover ${publication.title}`} onClick={() => removePublication(publication)}><Trash2 size={15} /></button></div></td>
            </tr>)}
          </tbody></table></div>
        </PageState>
      </Modal>
      {editor && <Modal title={editor.id ? 'Editar publicação' : 'Nova publicação'} onClose={() => setEditor(null)}>
        <form className="modal-form" onSubmit={savePublication}>
          <label className="form-label">Título<input name="title" required maxLength={200} defaultValue={editor.title} /></label>
          <div className="form-two-col"><label className="form-label">Tema<input name="theme" required maxLength={100} defaultValue={editor.theme} /></label><label className="form-label">Formato<select name="format" defaultValue={editor.format}>{Object.entries(formatNames).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label></div>
          <label className="form-label">Data e hora<input name="published_at" type="datetime-local" required defaultValue={editor.published_at} /></label>
          <label className="form-label">Legenda<textarea name="caption" rows="2" defaultValue={editor.caption || ''} /></label>
          <label className="form-label">Link<input name="link" type="url" defaultValue={editor.link || ''} placeholder="https://" /></label>
          {actionError && <div className="form-alert" role="alert">{actionError}</div>}
          <div className="modal-actions"><button type="button" className="button button-outline" onClick={() => setEditor(null)}>Cancelar</button><button className="button button-primary">Salvar publicação</button></div>
        </form>
      </Modal>}
      {countEditor && <CountEditor publication={countEditor} onClose={() => setCountEditor(null)} onSaved={async () => { setCountEditor(null); await loadPublications() }} />}
    </>
  )
}

function CountEditor({ publication, onClose, onSaved }) {
  const fields = publication.kind === 'metrics'
    ? [['views', 'Visualizações'], ['likes', 'Curtidas'], ['comments', 'Comentários'], ['shares', 'Compartilhamentos'], ['clicks', 'Cliques']]
    : [['downloads', 'Downloads'], ['signups', 'Cadastros'], ['active_users', 'Usuários ativos']]
  const current = publication.kind === 'metrics' ? publication.metrics : publication.conversions
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)
    const values = Object.fromEntries(new FormData(event.currentTarget))
    const payload = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, Number(value)]))
    try {
      if (publication.kind === 'metrics') await api.updateMetrics(publication.id, payload)
      else await api.updateConversions(publication.id, payload)
      await onSaved()
    } catch (issue) { setError(issue.message) }
    finally { setSaving(false) }
  }

  return <Modal title={`${publication.kind === 'metrics' ? 'Atualizar métricas' : 'Atualizar conversões'} · ${publication.title}`} onClose={onClose}>
    <form className="modal-form" onSubmit={submit}>
      <p className="form-hint">Informe os totais atuais registrados para esta publicação.</p>
      <div className="count-fields">{fields.map(([key, label]) => <label className="form-label" key={key}>{label}<input type="number" name={key} min="0" step="1" required defaultValue={current?.[key] ?? 0} /></label>)}</div>
      {error && <div className="form-alert" role="alert">{error}</div>}
      <div className="modal-actions"><button type="button" className="button button-outline" onClick={onClose}>Cancelar</button><button className="button button-primary" disabled={saving}>{saving ? 'Salvando...' : 'Salvar dados'}</button></div>
    </form>
  </Modal>
}

function localDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

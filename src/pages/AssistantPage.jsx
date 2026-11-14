import { useState } from 'react'
import { Bot, Send, Sparkles, UserRound } from 'lucide-react'
import { api } from '../api.js'
import { Notice } from '../ui.jsx'

const ASSISTANT_NOT_CONFIGURED = 'O assistente está temporariamente indisponível. Tente novamente mais tarde.'
const REQUEST_FAILED = 'Não foi possível enviar sua pergunta. Verifique sua conexão e tente novamente.'

export default function AssistantPage() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  async function submit(event) {
    event.preventDefault()
    const question = message.trim()
    if (!question || sending) return

    setError('')
    setSending(true)
    try {
      const result = await api.assistantChat(question)
      if (typeof result?.answer !== 'string') {
        throw new Error('A resposta do assistente veio em um formato inesperado.')
      }
      setMessages((current) => [
        ...current,
        { role: 'user', content: question },
        { role: 'assistant', content: result.answer },
      ])
      setMessage('')
    } catch (issue) {
      setError(
        issue.status === 503 && issue.data?.error === 'assistant_not_configured'
          ? ASSISTANT_NOT_CONFIGURED
          : issue.status
            ? issue.message
            : REQUEST_FAILED,
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="assistant-layout" aria-busy={sending}>
      <div className="panel assistant-panel">
        <div className="assistant-intro">
          <span className="assistant-icon"><Sparkles size={19} /></span>
          <div>
            <h2>Converse com seus dados</h2>
            <p>Faça uma pergunta sobre os dados agregados da sua conta.</p>
          </div>
        </div>

        <div className="assistant-conversation" aria-live="polite" aria-relevant="additions">
          {messages.length ? messages.map((item, index) => (
            <article className={`assistant-message assistant-message-${item.role}`} key={`${index}-${item.role}`}>
              <span className="assistant-message-icon" aria-hidden="true">
                {item.role === 'assistant' ? <Bot size={16} /> : <UserRound size={16} />}
              </span>
              <div>
                <strong>{item.role === 'assistant' ? 'Assistente' : 'Você'}</strong>
                <p>{item.content}</p>
              </div>
            </article>
          )) : (
            <div className="assistant-empty">
              <Bot size={22} />
              <p>Suas perguntas e respostas aparecerão aqui.</p>
            </div>
          )}
          {sending && <p className="assistant-status" role="status">Preparando resposta...</p>}
        </div>

        {error && <div className="form-alert assistant-error" role="alert">{error}</div>}

        <form className="assistant-form" onSubmit={submit}>
          <label className="form-label" htmlFor="assistant-message">Sua pergunta</label>
          <textarea
            id="assistant-message"
            name="message"
            rows="3"
            maxLength={2000}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ex.: Como estão os resultados agregados das minhas campanhas?"
            aria-describedby="assistant-message-count"
            required
          />
          <div className="assistant-form-footer">
            <span id="assistant-message-count">{message.length}/2000 caracteres</span>
            <button className="button button-primary" disabled={sending || !message.trim()}>
              <Send size={15} /> {sending ? 'Enviando...' : 'Enviar pergunta'}
            </button>
          </div>
        </form>
      </div>
      <Notice>
        O assistente responde com base apenas nos dados agregados da sua conta. Ele não altera campanhas nem publicações.
      </Notice>
    </section>
  )
}

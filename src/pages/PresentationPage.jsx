import { Component, useEffect, useState } from 'react'
import { Copy, Info, Wifi } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Notice } from '../ui.jsx'

function isLoopback(hostname) {
  return hostname === 'localhost' || hostname.endsWith('.localhost') || hostname === '::1' || /^127(?:\.\d{1,3}){3}$/.test(hostname)
}

function makeShareUrl(address) {
  const url = new URL(window.location.href)
  url.username = ''
  url.password = ''
  url.pathname = '/login'
  url.search = ''
  url.hash = ''
  if (address) url.hostname = address
  return url.toString()
}

class QrCodeErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <div className="presentation-qr-error" role="alert">Não foi possível gerar o QR code. Atualize a página e tente novamente.</div>
    }
    return this.props.children
  }
}

export default function PresentationPage() {
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const [error, setError] = useState('')
  const [copyStatus, setCopyStatus] = useState('')

  useEffect(() => {
    let active = true
    const currentUrl = new URL(window.location.href)

    if (!isLoopback(currentUrl.hostname)) {
      setShareUrl(makeShareUrl(''))
      return () => { active = false }
    }

    fetch('/__presentation/network-address')
      .then(async (response) => {
        if (!response.ok) throw new Error('Não foi possível consultar os endereços de rede.')
        return response.json()
      })
      .then(({ addresses: availableAddresses }) => {
        if (!active) return
        if (!Array.isArray(availableAddresses) || availableAddresses.length === 0) {
          setError('Não encontramos um endereço IPv4 privado para esta rede. Abra o frontend pelo endereço IP local do computador para gerar o QR code.')
          return
        }
        setAddresses(availableAddresses)
        setSelectedAddress(availableAddresses[0])
        setShareUrl(makeShareUrl(availableAddresses[0]))
      })
      .catch(() => {
        if (active) {
          setError('Não foi possível descobrir o endereço de rede. Abra o frontend pelo endereço IP local do computador e tente novamente.')
        }
      })

    return () => { active = false }
  }, [])

  async function copyUrl() {
    if (!shareUrl) return
    setCopyStatus('')
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopyStatus('Endereço copiado.')
    } catch {
      setCopyStatus('Não foi possível copiar automaticamente. Selecione o endereço e copie-o.')
    }
  }

  function chooseAddress(event) {
    const address = event.target.value
    setSelectedAddress(address)
    setShareUrl(makeShareUrl(address))
  }

  return (
    <div className="presentation-layout">
      <section className="panel presentation-panel">
        <div className="presentation-intro">
          <span className="presentation-icon"><Wifi size={20} /></span>
          <div>
            <h2>Abra o Nexora no celular</h2>
            <p>Escaneie o QR code com a câmera do celular para abrir esta página.</p>
          </div>
        </div>

        {addresses.length > 1 && (
          <label className="presentation-network-select">
            Endereço de rede do computador
            <select value={selectedAddress} onChange={chooseAddress}>
              {addresses.map((address) => <option key={address} value={address}>{address}</option>)}
            </select>
          </label>
        )}

        {error ? (
          <div className="presentation-qr-error" role="alert">{error}</div>
        ) : shareUrl ? (
          <div className="presentation-share">
            <div className="presentation-qr" aria-label="QR code para abrir o frontend no celular">
              <QrCodeErrorBoundary key={shareUrl}>
                <QRCodeSVG value={shareUrl} size={280} level="H" bgColor="#ffffff" fgColor="#10233f" title="QR code para abrir o Nexora no celular" />
              </QrCodeErrorBoundary>
            </div>
            <label className="presentation-url-label" htmlFor="presentation-url">Endereço para abrir no celular</label>
            <div className="presentation-url-row">
              <input id="presentation-url" type="url" readOnly value={shareUrl} onFocus={(event) => event.target.select()} />
              <button className="button button-primary" type="button" onClick={copyUrl}><Copy size={15} /> Copiar</button>
            </div>
            <p className="presentation-copy-status" role="status">{copyStatus}</p>
          </div>
        ) : (
          <div className="presentation-loading" role="status"><span className="spinner" /> Preparando o QR code...</div>
        )}
      </section>

      <Notice><Wifi size={16} /> Na apresentação local, conecte o celular e o computador à mesma rede Wi-Fi. Se for solicitado, permita o acesso pela rede no firewall do computador.</Notice>
      <Notice tone="info"><Info size={16} /> Quem acessar pelo celular precisará entrar com sua própria conta. Nenhum token, senha ou credencial é incluído no QR code.</Notice>
      <Notice tone="info">Para o celular acessar a API na rede local, configure <code>VITE_API_URL</code> com o endereço IP do computador e a porta 5000. Para uma demonstração pública, use o endereço HTTPS publicado do frontend e a URL publicada da API.</Notice>
    </div>
  )
}

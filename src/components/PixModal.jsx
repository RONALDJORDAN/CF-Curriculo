import React, { useEffect, useState } from 'react'

// Modal PIX como ilha React — escuta window event 'cf:abrir-pix' e também expõe abrirPix global
export function abrirPixGlobal() { window.dispatchEvent(new CustomEvent('cf:abrir-pix')) }
export function fecharPixGlobal() { window.dispatchEvent(new CustomEvent('cf:fechar-pix')) }

export default function PixModal() {
  const [aberto, setAberto] = useState(false)

  useEffect(() => {
    const a = () => setAberto(true)
    const f = () => setAberto(false)
    window.addEventListener('cf:abrir-pix', a)
    window.addEventListener('cf:fechar-pix', f)
    // compat: botões vanilla onclick="abrirPix()"
    window.abrirPix = abrirPixGlobal
    window.fecharPix = fecharPixGlobal
    const esc = (e) => { if (e.key === 'Escape') setAberto(false) }
    window.addEventListener('keydown', esc)
    return () => {
      window.removeEventListener('cf:abrir-pix', a)
      window.removeEventListener('cf:fechar-pix', f)
      window.removeEventListener('keydown', esc)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = aberto ? 'hidden' : ''
  }, [aberto])

  function copiar() {
    const txt = document.getElementById('pix-chave-txt-react')?.textContent?.trim() || ''
    const done = () => alert('Chave PIX copiada 💛 Deus abençoe!')
    if (navigator.clipboard && txt) navigator.clipboard.writeText(txt).then(done).catch(done)
    else done()
  }

  if (!aberto) return null
  return (
    <div className="pix-modal aberto" role="dialog" aria-modal="true" aria-labelledby="pix-tit-react">
      <div className="pix-fundo" onClick={() => setAberto(false)}></div>
      <div className="pix-caixa">
        <div className="pix-topo"><b id="pix-tit-react">💛 DAR AQUELE TROCADO</b><button className="pix-x" onClick={() => setAberto(false)} aria-label="Fechar">✕</button></div>
        <div className="pix-corpo">
          <div className="pix-qr"><span>QR CODE<br />AQUI<br /><small>salve como pix-qr.png</small></span></div>
          <div className="pix-txt">
            <p className="pix-msg">Qualquer valor ajuda um freelancer autônomo.<br />Entregue, Deus abençoe e obrigado!</p>
            <p className="pix-verso">“Deus ama ao que dá com alegria.”<br /><b>— 2 Coríntios 9:7</b></p>
            <div className="pix-chave">
              <small>SUA CHAVE PIX</small>
              <b id="pix-chave-txt-react">PIX-AQUI</b>
              <button className="btn btn-amarelo" type="button" onClick={copiar}>Copiar chave</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

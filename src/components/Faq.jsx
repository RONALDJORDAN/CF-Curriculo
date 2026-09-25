import React, { useEffect, useState } from 'react'

// Ilha React da FAQ — hidrata a FAQ estática do HTML sem quebrar o vanilla
export default function Faq({ itens }) {
  const [aberto, setAberto] = useState(-1)
  const [refs, setRefs] = useState([])

  useEffect(() => {
    // Se o HTML já tem .faq-item vanilla, esconde o fallback vanilla quando React assume
    const vanilla = document.querySelectorAll('.faq[data-vanilla] .faq-a')
    vanilla.forEach((a) => { a.style.maxHeight = '' })
  }, [])

  return (
    <div className="faq">
      {itens.map((it, i) => {
        const on = aberto === i
        return (
          <div className={`faq-item${on ? ' aberto' : ''}`} key={i}>
            <button className="faq-q" type="button" onClick={() => setAberto(on ? -1 : i)}>
              {it.q}<span className="sinal">{on ? '×' : '+'}</span>
            </button>
            <div className="faq-a" ref={(el) => { refs[i] = el }} style={{ maxHeight: on ? 300 : 0 }}>
              <p>{it.a}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export const FAQ_PADRAO = [
  { q: 'É realmente grátis?', a: 'Sim, 100% grátis, sem cadastro, sem limite e sem marca d’água. Tudo roda no seu navegador.' },
  { q: 'Meus dados vão pra internet?', a: 'Não. Tudo fica salvo localmente no seu navegador (IndexedDB). Nenhum dado sai do seu PC.' },
  { q: 'Como baixo em PDF?', a: 'Na página de criação, clique em “Baixar PDF” (gera via jsPDF) ou “Imprimir”, papel A4 e marque “Gráficos de segundo plano”.' },
  { q: 'Posso trocar de modelo depois?', a: 'Pode. Seus dados continuam e o visual troca na hora. São 3 modelos principais, simples mas eficaz.' },
  { q: 'Funciona no celular?', a: 'Sim. O site e a ferramenta são responsivos; no celular o preview fica abaixo do formulário.' },
]

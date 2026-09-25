import React, { useEffect, useState } from 'react'
import CvFolha from './CvFolha.jsx'

// Contador animado (port do site.js data-contar)
export function Contador({ alvo }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let raf, ini = null
    const dur = 1200
    const passo = (t) => {
      if (!ini) ini = t
      const p = Math.min(1, (t - ini) / dur)
      const ease = 1 - Math.pow(1 - p, 3)
      setV(Math.round(alvo * ease))
      if (p < 1) raf = requestAnimationFrame(passo)
    }
    const obs = new IntersectionObserver((ents) => {
      ents.forEach((e) => { if (e.isIntersecting) { raf = requestAnimationFrame(passo); obs.disconnect() } })
    }, { threshold: 0.4 })
    obs.observe(document.body)
    // fallback: anima direto
    const to = setTimeout(() => setV(alvo), 2500)
    return () => { cancelAnimationFrame(raf); obs.disconnect(); clearTimeout(to) }
  }, [alvo])
  return <span>{v}</span>
}

// Prévia real nos cards .prev-wrap (mesmo exemplo Ana Marcia)
export function PreviasReais() {
  useEffect(() => {
    document.querySelectorAll('.prev-wrap[data-modelo]').forEach((w) => {
      if (w.dataset.hidratado) return
      w.dataset.hidratado = '1'
      w.style.cursor = 'zoom-in'
      w.title = 'Clique para ampliar'
    })
  }, [])
  return null
}

// Guia "qual modelo escolher" (port do GUIA do site.js)
const GUIA = {
  primeiro: { tit: '■ 1º EMPREGO — BEGE LIMPO OU COMPACTO (1 coluna)', txt: 'Grandes empresas exigem: contato com LinkedIn + cidade/UF, objetivo com cargo exato, formação com ano, experiências sem CLT, Office/idiomas/cursos e 3-5 soft skills. Espelhe as palavras do anúncio.', modelo: 'bege-limpo', alt: 'compacto', altNome: 'Compacto' },
  estagio: { tit: '■ ESTÁGIO — COMPACTO OU CENTRAL (1 coluna)', txt: 'Filtro: curso, instituição e previsão de conclusão no topo, mais Office e conhecimentos básicos. Formação primeiro, depois cursos e projetos datados.', modelo: 'compacto', alt: 'central', altNome: 'Central Clássico' },
  formal: { tit: '■ VAGA FORMAL / ADMINISTRATIVO — EXECUTIVO OU QUADRADO', txt: 'Experiência reversa com bullets ação+contexto+resultado e números. Sóbrio transmite responsabilidade. Com ATS, prefira o Quadrado 1 coluna.', modelo: 'executivo', alt: 'quadrado', altNome: 'Quadrado Cheio' },
  vendas: { tit: '■ VENDAS / ATENDIMENTO — TOPO AMARELO OU FAIXA', txt: 'Decide no número: metas, conversão, ticket, clientes/semana. Objetivo consultivo + área. Quantifique resultados.', modelo: 'topo-amarelo', alt: 'faixa', altNome: 'Faixa Esquerda' },
  ti: { tit: '■ TI / SUPORTE — QUADRADO OU BEGE LIMPO (1 coluna, ATS-safe)', txt: 'Filtro técnico literal: stack exata, projetos com link, certificações com ano. Evite 2 colunas/tabela/ícone. Habilidades separadas por vírgula.', modelo: 'quadrado', alt: 'bege-limpo', altNome: 'Bege Limpo' },
  academico: { tit: '■ ACADÊMICO — BEGE LIMPO OU CENTRAL (1 coluna)', txt: 'Formação completa, cursos relevantes, idiomas com nível real, projetos e certificações datadas. Sem foto, PDF selecionável.', modelo: 'bege-limpo', alt: 'central', altNome: 'Central Clássico' },
}

export function GuiaModelos() {
  const [chave, setChave] = useState('primeiro')
  const g = GUIA[chave]
  useEffect(() => {
    // hidrata chips vanilla se existirem
    const chips = document.querySelectorAll('#guia-chips .chip')
    chips.forEach((c) => {
      c.onclick = () => setChave(c.dataset.guia || 'primeiro')
    })
  }, [])
  return (
    <div className="painel guia-painel">
      <b className="painel-tit" id="guia-tit-react">{g.tit}</b>
      <p id="guia-txt-react">{g.txt}</p>
      <div className="guia-links">
        <a className="btn btn-amarelo" href={`criar.html?modelo=${g.modelo}`}>Testar indicado →</a>
        <span className="guia-alt">Alternativa: <a href={`criar.html?modelo=${g.alt}`}>{g.altNome}</a></span>
      </div>
      <p className="guia-nota">No final, todo currículo serve pra <b>comprovação acadêmica e de conhecimentos</b>: formação, cursos, experiências com números e habilidades valem mais que cor ou enfeite.</p>
      <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {Object.keys(GUIA).map((k) => (
          <button key={k} type="button" className={`chip${k === chave ? ' ativo' : ''}`} onClick={() => setChave(k)}>{k}</button>
        ))}
      </div>
    </div>
  )
}

// Mini folha React para hidratar .prev-wrap sem innerHTML vanilla
export function MiniFolha({ modelo = 'quadrado', tema = 'marrom' }) {
  const cv = {
    nome: 'Ana Marcia', cargo: modelo === 'compacto' ? 'Estágio Administrativo' : 'Auxiliar Administrativa',
    email: 'ana.marcia@email.com', tel: '(11) 99999-1234', cidade: 'São Paulo / SP', link: 'linkedin.com/in/anamarcia',
    resumo: modelo === 'compacto'
      ? 'Estou em busca de oportunidades como Estágio Administrativo na área Administrativa onde posso aplicar e expandir meus conhecimentos em Excel e Organização, contribuindo com resultados sólidos para a equipe.'
      : (modelo === 'bege-limpo' || modelo === 'central'
        ? 'Busco vaga como Auxiliar Administrativa. Organizada, domino Excel e aprendo rápido.'
        : 'Profissional organizada com 3 anos de experiência em atendimento e rotinas administrativas.'),
    skills: 'Excel, Vendas, Atend.', cor: tema, modelo,
    exps: [{ cargo: 'Auxiliar Administrativa — Comércio Central LTDA', empresa: '', periodo: '2022 - 2024', desc: 'Atendimento, planilhas e emissão de notas.' }],
    edus: [{ curso: 'Ensino Médio Completo', escola: 'E.E. Central', ano: '2019' }],
  }
  return (
    <div className="mini-folha-wrap" style={{ zoom: 0.4, width: '250%', pointerEvents: 'none', userSelect: 'none' }}>
      <CvFolha cv={cv} />
    </div>
  )
}

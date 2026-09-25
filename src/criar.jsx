import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import CvFolha from './components/CvFolha.jsx'
import PixModal from './components/PixModal.jsx'
import { CV_VAZIO, EXEMPLO_ANA, MODELOS_VALIDOS, carregarCVSalvo, exigeInstituicao, idbDel, idbSet, modeloDaURL } from './lib/cv.js'
import { exportarPDFFolha, nomeArquivoPDF } from './lib/pdf.js'

// Ilha React principal da ferramenta — mesclada dentro do criar.html existente.
// Mantém wizard 6 passos, foto local, IndexedDB, preview ao vivo + PDF melhorado (jspdf).
const PASSOS = ['Dados', 'Histórico', 'Formação', 'Competências', 'Objetivo', 'Finalizar']

function useDebouncedSave(cv) {
  useEffect(() => {
    const t = setTimeout(() => { idbSet(cv).catch(() => {}) }, 300)
    return () => clearTimeout(t)
  }, [cv])
}

function CriarApp() {
  const [cv, setCv] = useState(CV_VAZIO)
  const [passo, setPasso] = useState(1)
  const [statusPdf, setStatusPdf] = useState('')
  const [toast, setToast] = useState('')
  const folhaRef = useRef(null)
  const set = (patch) => setCv((c) => ({ ...c, ...patch }))

  useEffect(() => {
    ;(async () => {
      const salvo = await carregarCVSalvo()
      const m = modeloDaURL('')
      if (salvo) {
        // Mescla com defaults para dados salvos antes das seções novas (cursos/projetos/idiomas/outras/soft)
        setCv({ ...CV_VAZIO, ...salvo, ...(m ? { modelo: m } : {}) })
        if (m) showToast(`■ Modelo ${m} aplicado`)
      } else {
        setCv({ ...CV_VAZIO, ...(m ? { modelo: m } : { modelo: 'bege-limpo' }) })
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useDebouncedSave(cv)

  function showToast(msg) {
    setToast(msg)
    clearTimeout(showToast._t)
    showToast._t = setTimeout(() => setToast(''), 2200)
  }

  function lerFoto(file) {
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Escolha uma imagem.'); return }
    if (file.size > 1.5 * 1024 * 1024) { alert('Foto até 1,5MB pra não pesar o salvamento.'); return }
    const r = new FileReader()
    r.onload = () => set({ foto: r.result })
    r.readAsDataURL(file)
  }

  async function baixarPDF() {
    showToast('⬇ Gerando PDF A4…')
    setStatusPdf('gerando')
    const ok = await exportarPDFFolha(folhaRef.current, nomeArquivoPDF(cv.nome), (s) => setStatusPdf(s))
    if (ok) showToast('✓ PDF baixado')
    else showToast('Impressão aberta (A4)')
  }

  function imprimirFallback() {
    window.print()
  }

  const resumo = useMemo(() => {
    const nSki = (cv.skills || '').split(',').map((s) => s.trim()).filter(Boolean).length
    return [
      `Nome: ${(cv.nome || '').trim() || '— não preenchido —'}`,
      `Experiências: ${(cv.exps || []).length} | Formações: ${(cv.edus || []).length}`,
      `Competências: ${nSki} | Objetivo: ${(cv.resumo || '').trim() ? 'Sim' : 'Não'}`,
    ]
  }, [cv])

  return (
    <div className="react-criar">
      <div className="pretensao">
        <h3 className="titulo-secao"><span className="num">★</span> QUAL SUA PRETENSÃO? <span style={{ fontSize: 11 }}>(React ⚛ mesclado)</span></h3>
        <p className="pretensao-sub">Escolha pra já sair com o modelo certo.</p>
        <div className="pretensao-grade">
          <button type="button" className={`btn btn-bege${cv.modelo === 'bege-limpo' ? ' selecionado' : ''}`} onClick={() => { set({ modelo: 'bege-limpo' }); setPasso(1); showToast('■ Pretensão: bege-limpo') }}>PRIMEIRO TRABALHO<small>Bege Limpo</small></button>
          <button type="button" className={`btn btn-marrom${cv.modelo === 'executivo' ? ' selecionado' : ''}`} onClick={() => { set({ modelo: 'executivo' }); setPasso(1); showToast('■ Pretensão: executivo') }}>MUDAR DE EMPREGO<small>Executivo</small></button>
          <button type="button" className={`btn btn-amarelo${cv.modelo === 'compacto' ? ' selecionado' : ''}`} onClick={() => { set({ modelo: 'compacto' }); setPasso(1); showToast('■ Pretensão: compacto') }}>ESTÁGIO / OUTRO<small>Compacto</small></button>
        </div>
      </div>

      <div className="wizard">
        <div className="wz-topo"><strong>Passo {passo} de 6</strong><span>Tudo salva sozinho ✓ {statusPdf ? `• PDF: ${statusPdf}` : ''}</span></div>
        <div className="wz-barra">
          {PASSOS.map((t, i) => (
            <button key={t} type="button" className={`wz-item${passo === i + 1 ? ' atual' : ''}${passo > i + 1 ? ' ok' : ''}`} onClick={() => setPasso(i + 1)}><b>{i + 1}</b>{t}</button>
          ))}
        </div>
      </div>

      {passo === 1 && (
        <div className="passo-form ativo">
          <h3 className="titulo-secao"><span className="num">01</span> DADOS DO USUÁRIO</h3>
          <div className="grade-2">
            <label>Nome completo<input value={cv.nome} onChange={(e) => set({ nome: e.target.value })} placeholder="Ex: Ana Marcia" /></label>
            <label>Cargo desejado<input value={cv.cargo} onChange={(e) => set({ cargo: e.target.value })} placeholder="Ex: Auxiliar Administrativo" /></label>
          </div>
          <div className="grade-2">
            <label>CPF (só se a vaga pedir)<input value={cv.cpf} onChange={(e) => set({ cpf: e.target.value })} placeholder="000.000.000-00" /></label>
            <label>Data de nascimento<input type="date" value={cv.nasc} onChange={(e) => set({ nasc: e.target.value })} /></label>
          </div>
          <div className="grade-2">
            <label>E-mail<input value={cv.email} onChange={(e) => set({ email: e.target.value })} placeholder="voce@email.com" /></label>
            <label>Telefone / WhatsApp<input value={cv.tel} onChange={(e) => set({ tel: e.target.value })} placeholder="(11) 99999-9999" /></label>
          </div>
          <div className="grade-2">
            <label>Cidade / UF<input value={cv.cidade} onChange={(e) => set({ cidade: e.target.value })} placeholder="São Paulo / SP" /></label>
            <label>LinkedIn / Portfólio<input value={cv.link} onChange={(e) => set({ link: e.target.value })} placeholder="linkedin.com/in/voce" /></label>
          </div>
          <div className="grade-2">
            <label>Foto (opcional)<input type="file" accept="image/*" onChange={(e) => lerFoto(e.target.files?.[0])} /></label>
            <label>&nbsp;<button className="btn btn-branco btn-peq" type="button" onClick={() => set({ foto: '' })}>Remover foto</button></label>
          </div>
        </div>
      )}

      {passo === 2 && (
        <div className="passo-form ativo">
          <h3 className="titulo-secao"><span className="num">02</span> HISTÓRICO PROFISSIONAL <button className="btn-mini" type="button" onClick={() => set({ exps: [...cv.exps, { cargo: '', empresa: '', periodo: '', desc: '' }] })}>+ Adicionar</button></h3>
          {cv.exps.map((ex, i) => (
            <div className="bloco-dinamico" key={i}>
              <button className="x" type="button" onClick={() => set({ exps: cv.exps.filter((_, k) => k !== i) })}>X</button>
              <label>Cargo<input value={ex.cargo} onChange={(e) => set({ exps: cv.exps.map((x, k) => k === i ? { ...x, cargo: e.target.value } : x) })} placeholder="Ex: Monitora — cargo | empresa no preview" /></label>
              <div className="grade-2">
                <label>Nome da empresa<input value={ex.empresa} onChange={(e) => set({ exps: cv.exps.map((x, k) => k === i ? { ...x, empresa: e.target.value } : x) })} placeholder="Ex: Faculdade Central" /></label>
                <label>Período<input value={ex.periodo} onChange={(e) => set({ exps: cv.exps.map((x, k) => k === i ? { ...x, periodo: e.target.value } : x) })} placeholder="Ex: 2022 - 2024" /></label>
              </div>
              <label>Descrição<textarea rows={2} value={ex.desc} onChange={(e) => set({ exps: cv.exps.map((x, k) => k === i ? { ...x, desc: e.target.value } : x) })} placeholder="O que você fazia?" /></label>
            </div>
          ))}
        </div>
      )}

      {passo === 3 && (
        <div className="passo-form ativo">
          <h3 className="titulo-secao"><span className="num">03</span> FORMAÇÃO ACADÊMICA <button className="btn-mini" type="button" onClick={() => set({ edus: [...(cv.edus || []), { curso: '', escola: '', ano: '' }] })}>+ Adicionar</button></h3>
          {(cv.edus || []).map((ed, i) => {
            const semEscola = exigeInstituicao(ed.curso) && !(ed.escola || '').trim()
            return (
            <div className="bloco-dinamico" key={i}>
              <button className="x" type="button" onClick={() => set({ edus: cv.edus.filter((_, k) => k !== i) })}>X</button>
              <label>Faculdade / Curso<input value={ed.curso} onChange={(e) => set({ edus: cv.edus.map((x, k) => k === i ? { ...x, curso: e.target.value } : x) })} placeholder="Ex: Administração — Cursando" /></label>
              <div className="grade-2">
                <label>Nome da instituição<input value={ed.escola} onChange={(e) => set({ edus: cv.edus.map((x, k) => k === i ? { ...x, escola: e.target.value } : x) })} placeholder="Ex: Faculdade Central" /></label>
                <label>Previsão de término (mês/ano)<input value={ed.ano} onChange={(e) => set({ edus: cv.edus.map((x, k) => k === i ? { ...x, ano: e.target.value } : x) })} placeholder="Ex: 12/2027" /></label>
              </div>
              {semEscola ? <p style={{ color: '#c0392b', fontSize: 13, fontWeight: 700 }}>⚠ Ensino Médio/Fundamental exige o nome da instituição.</p> : null}
            </div>
            )
          })}
          <h3 className="titulo-secao" style={{ marginTop: 14 }}><span className="num">03b</span> CURSOS E CERTIFICAÇÕES <button className="btn-mini" type="button" onClick={() => set({ cursos: [...(cv.cursos || []), { cert: '', emissora: '', periodo: '' }] })}>+ Adicionar</button></h3>
          {(cv.cursos || []).map((cu, i) => (
            <div className="bloco-dinamico" key={i}>
              <button className="x" type="button" onClick={() => set({ cursos: cv.cursos.filter((_, k) => k !== i) })}>X</button>
              <label>Nome do certificado<input value={cu.cert} onChange={(e) => set({ cursos: cv.cursos.map((x, k) => k === i ? { ...x, cert: e.target.value } : x) })} placeholder="Ex: Excel Básico" /></label>
              <div className="grade-2">
                <label>Empresa emissora<input value={cu.emissora} onChange={(e) => set({ cursos: cv.cursos.map((x, k) => k === i ? { ...x, emissora: e.target.value } : x) })} placeholder="Ex: Fundação Bradesco" /></label>
                <label>Mês/ano<input value={cu.periodo} onChange={(e) => set({ cursos: cv.cursos.map((x, k) => k === i ? { ...x, periodo: e.target.value } : x) })} placeholder="Ex: 03/2024" /></label>
              </div>
            </div>
          ))}
        </div>
      )}

      {passo === 4 && (
        <div className="passo-form ativo">
          <h3 className="titulo-secao"><span className="num">04</span> COMPETÊNCIAS</h3>
          <label>Habilidades técnicas — se tiver (separe por vírgula)<input value={cv.skills} onChange={(e) => set({ skills: e.target.value })} placeholder="Ex: Excel, Word, Atendimento" /></label>
          <label>Idiomas<input value={cv.idiomas || ''} onChange={(e) => set({ idiomas: e.target.value })} placeholder="Ex: Inglês — Básico, Espanhol — Intermediário" /></label>
          <label>Outras habilidades (conhecimentos avulsos, sem comprovação)<input value={cv.outras || ''} onChange={(e) => set({ outras: e.target.value })} placeholder="Ex: Digitação, Organização de arquivos" /></label>
          <label>Habilidades interpessoais (soft skills, separe por vírgula)<input value={cv.soft || ''} onChange={(e) => set({ soft: e.target.value })} placeholder="Ex: Proatividade, Trabalho em equipe, Comunicação" /></label>
          <h3 className="titulo-secao" style={{ marginTop: 14 }}><span className="num">04b</span> PROJETOS APRESENTÁVEIS <button className="btn-mini" type="button" onClick={() => set({ projetos: [...(cv.projetos || []), { nome: '', desc: '' }] })}>+ Adicionar</button></h3>
          {(cv.projetos || []).map((pj, i) => (
            <div className="bloco-dinamico" key={i}>
              <button className="x" type="button" onClick={() => set({ projetos: cv.projetos.filter((_, k) => k !== i) })}>X</button>
              <label>Nome do projeto<input value={pj.nome} onChange={(e) => set({ projetos: cv.projetos.map((x, k) => k === i ? { ...x, nome: e.target.value } : x) })} placeholder="Ex: Planilha de controle de estoque" /></label>
              <label>Breve descrição<textarea rows={2} value={pj.desc} onChange={(e) => set({ projetos: cv.projetos.map((x, k) => k === i ? { ...x, desc: e.target.value } : x) })} placeholder="O que o projeto faz/entrega?" /></label>
            </div>
          ))}
        </div>
      )}

      {passo === 5 && (
        <div className="passo-form ativo">
          <h3 className="titulo-secao"><span className="num">05</span> OBJETIVO</h3>
          <label>Objetivo profissional<textarea rows={4} value={cv.resumo} onChange={(e) => set({ resumo: e.target.value })} placeholder={cv.modelo === 'compacto' ? 'Estou em busca de oportunidades como (cargo) na área (área de atuação) onde posso aplicar e expandir meus conhecimentos em (habilidade 1) e (habilidade 2), contribuindo com resultados sólidos para a equipe.' : 'Ex: Atuar como Auxiliar Administrativo...'} /></label>
        </div>
      )}

      {passo === 6 && (
        <div className="passo-form ativo">
          <h3 className="titulo-secao"><span className="num">06</span> FINALIZAR</h3>
          <ul className="resumo-final">{resumo.map((r, i) => <li key={i}><b>■</b>{r}</li>)}</ul>
          <div className="grade-2">
            <label>Cor do cabeçalho do CV
              <select value={cv.cor} onChange={(e) => set({ cor: e.target.value })}>
                <option value="marrom">Marrom clássico</option>
                <option value="amarelo">Amarelo destaque</option>
                <option value="bege">Bege minimalista</option>
              </select>
            </label>
            <label>Modelo ({MODELOS_VALIDOS.length} opções — 3 principais)
              <select value={cv.modelo} onChange={(e) => set({ modelo: e.target.value })}>
                <option value="bege-limpo">01 — Primeiro Emprego (Bege Limpo)</option>
                <option value="executivo">02 — Concorrer Vaga (Executivo)</option>
                <option value="compacto">03 — Estágio / Acadêmico (Compacto)</option>
                {MODELOS_VALIDOS.filter((m) => !['bege-limpo', 'executivo', 'compacto'].includes(m)).map((m) => (
                  <option key={m} value={m}>{m} (legado)</option>
                ))}
              </select>
            </label>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
            <button className="btn btn-amarelo btn-grande" type="button" onClick={baixarPDF} style={{ flex: 1 }}>⬇ Baixar PDF (jsPDF)</button>
            <button className="btn btn-branco" type="button" onClick={imprimirFallback}>Imprimir A4</button>
          </div>
        </div>
      )}

      <div className="wizard-nav">
        <button className="btn btn-branco" disabled={passo === 1} onClick={() => setPasso((p) => Math.max(1, p - 1))}>← Voltar</button>
        <button className="btn btn-amarelo" onClick={() => { if (passo === 6) baixarPDF(); else setPasso((p) => Math.min(6, p + 1)) }}>
          {passo === 6 ? '⬇ Baixar PDF' : 'Avançar →'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
        <button className="btn btn-bege btn-peq" type="button" onClick={() => { setCv({ ...EXEMPLO_ANA }); showToast('⚡ Exemplo carregado') }}>Carregar exemplo</button>
        <button className="btn btn-branco btn-peq" type="button" onClick={async () => { if (!confirm('Apagar tudo e começar do zero?')) return; await idbDel(); setCv(CV_VAZIO); setPasso(1) }}>Limpar</button>
      </div>

      <div className="painel-preview" style={{ marginTop: 16 }}>
        <div className="barra-preview"><strong>■ PRÉVIA (React ao vivo)</strong><div style={{ display: 'flex', gap: 8 }}><button className="btn btn-amarelo btn-peq" type="button" onClick={baixarPDF}>⬇ PDF</button></div></div>
        <CvFolha cv={cv} innerRef={folhaRef} />
        <p className="dica">Novo: PDF via jsPDF/html2canvas. Fallback: impressão A4 com “Gráficos de segundo plano”.</p>
      </div>

      {toast ? <div id="cf-toast" className="mostrar" role="status">{toast}</div> : null}
    </div>
  )
}

{
  const holder = document.getElementById('react-criar')
  if (holder) createRoot(holder).render(<CriarApp />)
  const pixHolder = document.createElement('div')
  document.body.appendChild(pixHolder)
  createRoot(pixHolder).render(<PixModal />)
}

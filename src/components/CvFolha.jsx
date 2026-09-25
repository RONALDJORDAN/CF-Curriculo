import React from 'react'
import { exigeInstituicao, fmtNasc } from '../lib/cv.js'

// Folha A4 pura React — mesmas classes do criar.css/site.css (modelo-* / tema-*)
export default function CvFolha({ cv, id = 'folha', innerRef }) {
  const nome = (cv.nome || '').trim() || 'Seu Nome Aqui'
  const cargo = (cv.cargo || '').trim() || 'Seu Cargo Desejado'
  const skills = (cv.skills || '').split(',').map((s) => s.trim()).filter(Boolean)
  const exps = (cv.exps || []).filter((e) => e.cargo || e.empresa || e.desc)
  const edus = (cv.edus || []).filter((e) => e.curso || e.escola)
  const nascFmt = fmtNasc(cv.nasc)
  const isCompacto = (cv.modelo || '') === 'compacto'
  // Padrão: cidade • telefone • email / links embaixo (LinkedIn, Instagram ou GitHub)
  const contatoLinha = isCompacto
    ? [cv.cidade, cv.tel, cv.email].filter(Boolean).join('  •  ') || 'cidade • telefone • email'
    : [cv.email, cv.tel, cv.cidade].filter(Boolean).join('  •  ') || 'email • telefone • cidade'
  const linksLinha = (cv.link || '').trim() || 'linkedin / instagram / github'
  // Texto semi-pronto do objetivo (modelo 3): cargo + área + 2 habilidades
  const objetivoTemplate = `Estou em busca de oportunidades como ${cargo} na área (área de atuação) onde posso aplicar e expandir meus conhecimentos em ${(skills[0] || '(habilidade 1)')} e ${(skills[1] || '(habilidade 2)')}, contribuindo com resultados sólidos para a equipe.`
  const objetivoTxt = (cv.resumo || '').trim() || objetivoTemplate

  return (
    <div id={id} ref={innerRef} className={`folha modelo-${cv.modelo || 'quadrado'} tema-${cv.cor || 'marrom'}`}>
      <div className="cv-topo">
        {cv.foto && !isCompacto ? <img className="cv-foto" src={cv.foto} alt="" /> : null}
        <div className="cv-topo-txt">
          <h2><b>{nome}</b></h2>
          {isCompacto ? null : <h4>{cargo}</h4>}
          <p className="cv-contato">{contatoLinha}</p>
          {isCompacto ? <p className="cv-links">{linksLinha}</p> : null}
        </div>
      </div>
      <div className="cv-corpo">
        <div className="cv-col-principal">
          <h5>■ OBJETIVO</h5>
          {isCompacto ? <p><b>Cargo almejado: {cargo}</b></p> : null}
          <p>{objetivoTxt}</p>
          <h5>■ {isCompacto ? 'FORMAÇÃO ACADÊMICA' : 'FORMAÇÃO'}</h5>
          <div>
            {edus.length ? edus.map((e, i) => (
              <div className="item-edu" key={i}>
                <b>{e.curso || 'Curso'}</b>
                <span>{[e.escola || (exigeInstituicao(e.curso) ? '— informe a instituição (obrigatório) —' : ''), e.ano].filter(Boolean).join(' • ')}</span>
              </div>
            )) : <p style={{ fontSize: 13 }}>Clique em <b>+ Adicionar</b> e cadastre sua formação.</p>}
          </div>
          <h5>■ {isCompacto ? 'EXPERIÊNCIA PROFISSIONAL' : 'EXPERIÊNCIA'}</h5>
          <div>
            {exps.length ? exps.map((e, i) => (
              <div className="item-exp" key={i}>
                <b>{e.cargo || 'Cargo'}{e.empresa ? (isCompacto ? ` | ${e.empresa}` : ` — ${e.empresa}`) : ''}</b>
                {e.periodo ? <span>{e.periodo}</span> : null}
                {e.desc ? <p>{e.desc}</p> : null}
              </div>
            )) : <p style={{ fontSize: 13 }}>Clique em <b>+ Adicionar</b> e cadastre sua experiência.</p>}
          </div>
          <h5>■ CURSOS E CERTIFICAÇÕES</h5>
          <div>
            {(cv.cursos || []).filter((c) => c.cert || c.emissora).length ? (cv.cursos || []).filter((c) => c.cert || c.emissora).map((c, i) => (
              <div className="item-edu" key={i}>
                <b>{c.cert || 'Certificado'}</b>
                <span>{[c.emissora, c.periodo].filter(Boolean).join(' - ')}</span>
              </div>
            )) : <p style={{ fontSize: 13 }}>Ex: Excel Básico - Fundação Bradesco - 03/2024</p>}
          </div>
          <h5>■ PROJETOS APRESENTÁVEIS</h5>
          <div>
            {(cv.projetos || []).filter((p) => p.nome || p.desc).length ? (cv.projetos || []).filter((p) => p.nome || p.desc).map((p, i) => (
              <div className="item-exp" key={i}>
                <b>{p.nome || 'Projeto'}</b>
                {p.desc ? <p>{p.desc}</p> : null}
              </div>
            )) : <p style={{ fontSize: 13 }}>Ex: Planilha de controle de estoque — breve descrição.</p>}
          </div>
          {skills.length ? (<><h5>■ HABILIDADES TÉCNICAS</h5><div>{skills.map((s, i) => <span className="tag" key={i}>{s}</span>)}</div></>) : null}
          {(cv.idiomas || '').trim() ? (<><h5>■ IDIOMAS</h5><p>{cv.idiomas}</p></>) : null}
          {(cv.outras || '').trim() ? (<><h5>■ OUTRAS HABILIDADES</h5><p>{cv.outras}</p></>) : null}
          {(cv.soft || '').trim() ? (<><h5>■ HABILIDADES INTERPESSOAIS (SOFT SKILLS)</h5><p>{cv.soft}</p></>) : null}
        </div>
        <aside className="cv-lateral">
          <h5>■ CONTATO</h5>
          <p>
            {cv.email ? <>{`✉ ${cv.email}`}<br /></> : null}
            {cv.tel ? <>{`☎ ${cv.tel}`}<br /></> : null}
            {cv.cidade ? <>{`⌂ ${cv.cidade}`}<br /></> : null}
            {cv.link ? <>{`🔗 ${cv.link}`}<br /></> : null}
            {cv.cpf ? <>{`🪪 CPF: ${cv.cpf}`}<br /></> : null}
            {nascFmt ? `🎂 ${nascFmt}` : (!cv.email && !cv.tel && !cv.cidade && !cv.link ? '—' : null)}
          </p>
          <h5>■ {isCompacto ? 'HABILIDADES TÉCNICAS' : 'HABILIDADES'}</h5>
          <div>{skills.length ? skills.map((s, i) => <span className="tag" key={i}>{s}</span>) : <p style={{ fontSize: 13 }}>Ex: Excel, Vendas...</p>}</div>
          <div className="cv-selo">FEITO NO<br /><b>CF</b></div>
        </aside>
      </div>
    </div>
  )
}

// CF — lógica pura do CV (mesma regra do criar.js vanilla, agora reutilizável no React)
export const MODELOS_VALIDOS = [
  'quadrado','faixa','lateral-direita','topo-amarelo','bege-limpo','compacto',
  'duas-colunas','inverso','moldura-dupla','executivo','central','amarelo-total',
]
// 3 modelos principais da vitrine (os outros 9 seguem funcionando como legado)
export const MODELOS_PRINCIPAIS = ['bege-limpo','executivo','compacto']
export const CORES = ['marrom','amarelo','bege']

export const EXEMPLO_ANA = {
  nome: 'Ana Marcia',
  cargo: 'Auxiliar Administrativo',
  email: 'ana.marcia@email.com',
  tel: '(11) 99999-1234',
  cidade: 'São Paulo / SP',
  link: 'linkedin.com/in/anamarcia',
  cpf: '', nasc: '', foto: '',
  resumo: 'Profissional organizada com 3 anos de experiência em atendimento e rotinas administrativas. Domínio de Excel e foco em resultados.',
  skills: 'Excel, Atendimento ao cliente, Organização, Digitação, Trabalho em equipe',
  cor: 'marrom', modelo: 'quadrado',
  exps: [
    { cargo: 'Auxiliar Administrativa', empresa: 'Comércio Central LTDA', periodo: '2022 - 2024', desc: 'Atendimento ao cliente, controle de planilhas, emissão de notas e organização de arquivos.' },
    { cargo: 'Recepcionista', empresa: 'Clínica Bem Estar', periodo: '2020 - 2022', desc: 'Agendamentos, recepção e suporte administrativo geral.' },
  ],
  edus: [
    { curso: 'Ensino Médio Completo', escola: 'E.E. Central', ano: '2019' },
    { curso: 'Informática Básica + Excel', escola: 'Curso Livre Online', ano: '2023' },
  ],
  cursos: [
    { cert: 'Excel Básico', emissora: 'Fundação Bradesco', periodo: '2024' },
  ],
  projetos: [
    { nome: 'Planilha de controle de estoque', desc: 'Planilha em Excel para controle de entradas e saídas de uma loja de bairro.' },
  ],
  idiomas: 'Inglês — Básico',
  outras: 'Digitação, Organização de arquivos',
  soft: 'Proatividade, Trabalho em equipe, Comunicação, Organização',
}

export const CV_VAZIO = {
  nome: '', cargo: '', cpf: '', nasc: '', email: '', tel: '',
  cidade: '', link: '', foto: '', resumo: '', skills: '',
  idiomas: '', outras: '', soft: '',
  cor: 'marrom', modelo: 'bege-limpo',
  exps: [{ cargo: '', empresa: '', periodo: '', desc: '' }],
  edus: [{ curso: '', escola: '', ano: '' }],
  cursos: [{ cert: '', emissora: '', periodo: '' }],
  projetos: [{ nome: '', desc: '' }],
}

// Ensino Médio/Fundamental exige nome da instituição (regra do modelo 3)
export function exigeInstituicao(curso) {
  return /ensino\s*(m[eé]dio|fundamental)/i.test(curso || '')
}

export function esc(s) {
  return (s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

// ---- IndexedDB (mesmo banco do vanilla: cf_db / curriculos / cv_atual) ----
const IDB_DB = 'cf_db'
const IDB_STORE = 'curriculos'
const IDB_KEY = 'cv_atual'
let _db = null

function abrirBanco() {
  if (_db) return Promise.resolve(_db)
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB, 1)
    req.onupgradeneeded = () => { req.result.createObjectStore(IDB_STORE) }
    req.onsuccess = () => { _db = req.result; resolve(_db) }
    req.onerror = () => reject(req.error)
  })
}
export async function idbSet(dados) {
  const db = await abrirBanco()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite')
    tx.objectStore(IDB_STORE).put(dados, IDB_KEY)
    tx.oncomplete = () => resolve(true)
    tx.onerror = () => reject(tx.error)
  })
}
export async function idbGet() {
  const db = await abrirBanco()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly')
    const q = tx.objectStore(IDB_STORE).get(IDB_KEY)
    q.onsuccess = () => resolve(q.result || null)
    q.onerror = () => reject(q.error)
  })
}
export async function idbDel() {
  try {
    const db = await abrirBanco()
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readwrite')
      tx.objectStore(IDB_STORE).delete(IDB_KEY)
      tx.oncomplete = () => resolve(true)
      tx.onerror = () => resolve(false)
    })
  } catch { return false }
}

export async function carregarCVSalvo() {
  try {
    let d = await idbGet()
    if (!d) {
      try {
        const raw = localStorage.getItem('cv_facil_v1')
        if (raw) { d = JSON.parse(raw); await idbSet(d); localStorage.removeItem('cv_facil_v1') }
      } catch {}
    }
    return d || null
  } catch { return null }
}

export function modeloDaURL(fallback = 'bege-limpo') {
  try {
    const q = new URLSearchParams(location.search).get('modelo')
    if (q && MODELOS_VALIDOS.includes(q)) return q
  } catch {}
  return fallback
}

export function fmtNasc(iso) {
  if (!iso) return ''
  const p = iso.split('-')
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : iso
}

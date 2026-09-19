// ===== CF — layout quadrado antigo | preview ao vivo + IndexedDB + PDF A4 =====

const IDB_DB = "cf_db";
const IDB_STORE = "curriculos";
const IDB_KEY = "cv_atual";
let _db = null;
let _suspenderSave = false;
let _saveTimer = null;

function esc(s){
  return (s || "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

// ---- IndexedDB ----
function abrirBanco(){
  if(_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB, 1);
    req.onupgradeneeded = () => { req.result.createObjectStore(IDB_STORE); };
    req.onsuccess = () => { _db = req.result; resolve(_db); };
    req.onerror = () => reject(req.error);
  });
}
async function idbSet(dados){
  const db = await abrirBanco();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(dados, IDB_KEY);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}
async function idbGet(){
  const db = await abrirBanco();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const q = tx.objectStore(IDB_STORE).get(IDB_KEY);
    q.onsuccess = () => resolve(q.result || null);
    q.onerror = () => reject(q.error);
  });
}
async function idbDel(){
  try{
    const db = await abrirBanco();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).delete(IDB_KEY);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  }catch(e){ return false; }
}

// ---- blocos dinâmicos ----
function addExp(d = {}){
  const box = document.createElement("div");
  box.className = "bloco-dinamico";
  box.innerHTML = `
    <button class="x" onclick="this.parentElement.remove();atualizar()">X</button>
    <label>Cargo<input class="e-cargo" placeholder="Ex: Vendedor" value="${esc(d.cargo||"")}"></label>
    <div class="grade-2">
      <label>Empresa<input class="e-empresa" placeholder="Ex: Loja Centro" value="${esc(d.empresa||"")}"></label>
      <label>Período<input class="e-periodo" placeholder="Ex: 2022 - 2024" value="${esc(d.periodo||"")}"></label>
    </div>
    <label>Descrição<textarea class="e-desc" rows="2" placeholder="O que você fazia? Ex: Atendimento, metas...">${esc(d.desc||"")}</textarea></label>`;
  box.querySelectorAll("input,textarea").forEach(el => el.addEventListener("input", atualizar));
  document.getElementById("lista-exp").appendChild(box);
  if(!_suspenderSave) atualizar();
}

function addEdu(d = {}){
  const box = document.createElement("div");
  box.className = "bloco-dinamico";
  box.innerHTML = `
    <button class="x" onclick="this.parentElement.remove();atualizar()">X</button>
    <label>Curso<input class="d-curso" placeholder="Ex: Ensino Médio Completo" value="${esc(d.curso||"")}"></label>
    <div class="grade-2">
      <label>Escola / Faculdade<input class="d-escola" placeholder="Ex: E.E. Central" value="${esc(d.escola||"")}"></label>
      <label>Ano<input class="d-ano" placeholder="Ex: 2023" value="${esc(d.ano||"")}"></label>
    </div>`;
  box.querySelectorAll("input").forEach(el => el.addEventListener("input", atualizar));
  document.getElementById("lista-edu").appendChild(box);
  if(!_suspenderSave) atualizar();
}

// ---- coleta / aplica ----
function coletar(){
  return {
    nome: document.getElementById("f-nome").value,
    cargo: document.getElementById("f-cargo").value,
    email: document.getElementById("f-email").value,
    tel: document.getElementById("f-tel").value,
    cidade: document.getElementById("f-cidade").value,
    link: document.getElementById("f-link").value,
    resumo: document.getElementById("f-resumo").value,
    skills: document.getElementById("f-skills").value,
    cor: document.getElementById("f-cor").value,
    modelo: document.getElementById("f-modelo").value,
    exps: [...document.querySelectorAll("#lista-exp .bloco-dinamico")].map(b => ({
      cargo: b.querySelector(".e-cargo").value,
      empresa: b.querySelector(".e-empresa").value,
      periodo: b.querySelector(".e-periodo").value,
      desc: b.querySelector(".e-desc").value
    })),
    edus: [...document.querySelectorAll("#lista-edu .bloco-dinamico")].map(b => ({
      curso: b.querySelector(".d-curso").value,
      escola: b.querySelector(".d-escola").value,
      ano: b.querySelector(".d-ano").value
    }))
  };
}

function aplicar(d){
  _suspenderSave = true;
  document.getElementById("f-nome").value = d.nome || "";
  document.getElementById("f-cargo").value = d.cargo || "";
  document.getElementById("f-email").value = d.email || "";
  document.getElementById("f-tel").value = d.tel || "";
  document.getElementById("f-cidade").value = d.cidade || "";
  document.getElementById("f-link").value = d.link || "";
  document.getElementById("f-resumo").value = d.resumo || "";
  document.getElementById("f-skills").value = d.skills || "";
  document.getElementById("f-cor").value = (d.cor || "marrom").trim();
  document.getElementById("f-modelo").value = d.modelo || "quadrado";
  document.getElementById("lista-exp").innerHTML = "";
  document.getElementById("lista-edu").innerHTML = "";
  (d.exps && d.exps.length ? d.exps : [{}]).forEach(addExp);
  (d.edus && d.edus.length ? d.edus : [{}]).forEach(addEdu);
  _suspenderSave = false;
  atualizar();
}

// ---- preview em TEMPO REAL ----
function atualizar(){
  const v = id => document.getElementById(id).value.trim();
  const nome = v("f-nome") || "Seu Nome Aqui";
  const cargo = v("f-cargo") || "Seu Cargo Desejado";
  const email = v("f-email"), tel = v("f-tel"), cid = v("f-cidade"), link = v("f-link");

  document.getElementById("p-nome").textContent = nome;
  document.getElementById("p-cargo").textContent = cargo;

  const contatoLinha = [email, tel, cid].filter(Boolean).join("  •  ") || "email • telefone • cidade";
  document.getElementById("p-contato").textContent = contatoLinha;
  document.getElementById("p-contato2").innerHTML =
    (email ? `✉ ${esc(email)}<br>` : "") +
    (tel ? `☎ ${esc(tel)}<br>` : "") +
    (cid ? `⌂ ${esc(cid)}<br>` : "") +
    (link ? `🔗 ${esc(link)}` : "") || "—";

  document.getElementById("p-resumo").textContent =
    v("f-resumo") || "Escreva seu objetivo profissional em 2-3 linhas.";

  const exps = [...document.querySelectorAll("#lista-exp .bloco-dinamico")].map(b => ({
    cargo: b.querySelector(".e-cargo").value.trim(),
    empresa: b.querySelector(".e-empresa").value.trim(),
    periodo: b.querySelector(".e-periodo").value.trim(),
    desc: b.querySelector(".e-desc").value.trim()
  })).filter(e => e.cargo || e.empresa || e.desc);

  document.getElementById("p-exp").innerHTML = exps.length
    ? exps.map(e => `<div class="item-exp">
        <b>${esc(e.cargo || "Cargo")}${e.empresa ? " — " + esc(e.empresa) : ""}</b>
        ${e.periodo ? `<span>${esc(e.periodo)}</span>` : ""}
        ${e.desc ? `<p>${esc(e.desc)}</p>` : ""}
      </div>`).join("")
    : `<p style="font-size:13px">Clique em <b>+ Adicionar</b> e cadastre sua experiência.</p>`;

  const edus = [...document.querySelectorAll("#lista-edu .bloco-dinamico")].map(b => ({
    curso: b.querySelector(".d-curso").value.trim(),
    escola: b.querySelector(".d-escola").value.trim(),
    ano: b.querySelector(".d-ano").value.trim()
  })).filter(e => e.curso || e.escola);

  document.getElementById("p-edu").innerHTML = edus.length
    ? edus.map(e => `<div class="item-edu">
        <b>${esc(e.curso || "Curso")}</b>
        <span>${esc([e.escola, e.ano].filter(Boolean).join(" • "))}</span>
      </div>`).join("")
    : `<p style="font-size:13px">Clique em <b>+ Adicionar</b> e cadastre sua formação.</p>`;

  const skills = v("f-skills").split(",").map(s => s.trim()).filter(Boolean);
  document.getElementById("p-skills").innerHTML = skills.length
    ? skills.map(s => `<span class="tag">${esc(s)}</span>`).join("")
    : `<p style="font-size:13px">Ex: Excel, Vendas...</p>`;

  const folha = document.getElementById("folha");
  const cor = document.getElementById("f-cor").value.trim().toLowerCase();
  const modelo = document.getElementById("f-modelo").value;
  folha.classList.remove("tema-marrom","tema-amarelo","tema-bege");
  folha.classList.add(cor === "amarelo" ? "tema-amarelo" : cor === "bege" ? "tema-bege" : "tema-marrom");
  const MODELOS = ["quadrado","faixa","lateral-direita","topo-amarelo","bege-limpo","compacto","duas-colunas","inverso","moldura-dupla","executivo"];
  MODELOS.forEach(m => folha.classList.remove("modelo-"+m));
  folha.classList.add(MODELOS.includes(modelo) ? "modelo-"+modelo : "modelo-quadrado");

  try{ if(typeof cfAnimaFolha === "function") cfAnimaFolha(modelo, cor); }catch(e){}
  salvar();
}

// ---- salvar / restaurar (IndexedDB + migração do localStorage) ----
function salvar(){
  if(_suspenderSave) return;
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(async () => {
    try { await idbSet(coletar()); } catch(e){}
  }, 300);
}

async function restaurar(){
  try{
    let d = await idbGet();
    if(!d){
      try{
        const raw = localStorage.getItem("cv_facil_v1");
        if(raw){ d = JSON.parse(raw); await idbSet(d); localStorage.removeItem("cv_facil_v1"); }
      }catch(e){}
    }
    if(!d) return false;
    aplicar(d);
    return true;
  }catch(e){ return false; }
}

// ---- ações ----
function carregarExemplo(){
  aplicar({
    nome: "Ana Marcia",
    cargo: "Auxiliar Administrativo",
    email: "ana.marcia@email.com",
    tel: "(11) 99999-1234",
    cidade: "São Paulo / SP",
    link: "linkedin.com/in/anamarcia",
    resumo: "Profissional organizada com 3 anos de experiência em atendimento e rotinas administrativas. Domínio de Excel e foco em resultados.",
    skills: "Excel, Atendimento ao cliente, Organização, Digitação, Trabalho em equipe",
    cor: "marrom", modelo: "quadrado",
    exps: [
      {cargo:"Auxiliar Administrativa", empresa:"Comércio Central LTDA", periodo:"2022 - 2024", desc:"Atendimento ao cliente, controle de planilhas, emissão de notas e organização de arquivos."},
      {cargo:"Recepcionista", empresa:"Clínica Bem Estar", periodo:"2020 - 2022", desc:"Agendamentos, recepção e suporte administrativo geral."}
    ],
    edus: [
      {curso:"Ensino Médio Completo", escola:"E.E. Central", ano:"2019"},
      {curso:"Informática Básica + Excel", escola:"Curso Livre Online", ano:"2023"}
    ]
  });
}

async function limparTudo(){
  if(!confirm("Apagar tudo e começar do zero?")) return;
  await idbDel();
  try{ localStorage.removeItem("cv_facil_v1"); }catch(e){}
  aplicar({ nome:"", cargo:"", email:"", tel:"", cidade:"", link:"", resumo:"", skills:"", cor:"marrom", modelo:"quadrado", exps:[{}], edus:[{}] });
}

// ---- PDF em modelo A4 ----
function imprimir(){
  atualizar();
  window.print();
}

// ---- card flutuante: ampliar / reduzir prévia ----
function alternarPreview(){
  const p = document.querySelector(".painel-preview");
  if(!p) return;
  const aberto = p.classList.toggle("expandido");
  document.querySelectorAll('[onclick="alternarPreview()"]').forEach(b => {
    b.textContent = aberto ? "⛶ Reduzir" : "⛶ Ampliar";
  });
}

// aliases de compatibilidade com o modelo novo (caso chame nomes em inglês)
function updatePreview(){ atualizar(); }
function loadOfficialExample(){ carregarExemplo(); }
function clearForm(){ limparTudo(); }
function printDocument(){ imprimir(); }

// ---- init ----
document.addEventListener("DOMContentLoaded", async () => {
  let temSalvo = false;
  try { temSalvo = await restaurar(); } catch(e){}
  if(!temSalvo){ carregarExemplo(); }
  // modelo vindo da homepage: criar.html?modelo=faixa
  try{
    const q = new URLSearchParams(location.search).get("modelo");
    const VALIDOS = ["quadrado","faixa","lateral-direita","topo-amarelo","bege-limpo","compacto","duas-colunas","inverso","moldura-dupla","executivo"];
    if(q && VALIDOS.includes(q)){
      document.getElementById("f-modelo").value = q;
      atualizar();
      cfToast("■ Modelo " + q + " aplicado");
    }
  }catch(e){}
  irParaPasso(1, false);
  setTimeout(initAnimacoesCF, 0);
});

/* ===== WIZARD 6 ETAPAS ===== */
let passoAtual = 1;
const TOTAL_PASSOS = 6;

function irParaPasso(n, rolar = true){
  passoAtual = Math.max(1, Math.min(TOTAL_PASSOS, n));
  document.querySelectorAll(".passo-form").forEach(p =>
    p.classList.toggle("ativo", +p.dataset.passo === passoAtual));
  document.querySelectorAll(".wz-item").forEach(el => {
    const k = +el.dataset.passo;
    el.classList.toggle("atual", k === passoAtual);
    el.classList.toggle("ok", k < passoAtual);
  });
  const rot = document.getElementById("wz-rotulo");
  if(rot) rot.textContent = "Passo " + passoAtual + " de " + TOTAL_PASSOS;
  const bv = document.getElementById("wz-voltar");
  const ba = document.getElementById("wz-avancar");
  if(bv) bv.disabled = passoAtual === 1;
  if(ba) ba.textContent = passoAtual === TOTAL_PASSOS ? "⬇ Baixar / Imprimir PDF" : "Avançar →";
  if(passoAtual === TOTAL_PASSOS) montarResumoFinal();
  if(rolar && innerWidth < 1000){
    const form = document.querySelector(".painel-form");
    if(form) form.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function proximoPasso(){
  if(passoAtual === TOTAL_PASSOS){ imprimir(); }
  else irParaPasso(passoAtual + 1);
}

function passoAnterior(){ irParaPasso(passoAtual - 1); }

function montarResumoFinal(){
  const el = document.getElementById("resumo-final");
  if(!el) return;
  const nome = document.getElementById("f-nome").value.trim() || "— não preenchido —";
  const nExp = document.querySelectorAll("#lista-exp .bloco-dinamico").length;
  const nEdu = document.querySelectorAll("#lista-edu .bloco-dinamico").length;
  const nSki = document.getElementById("f-skills").value.split(",").map(s => s.trim()).filter(Boolean).length;
  const temObj = document.getElementById("f-resumo").value.trim() ? "Sim" : "Não";
  el.innerHTML =
    "<li><b>■</b>Nome: " + esc(nome) + "</li>" +
    "<li><b>■</b>Experiências: " + nExp + " | Formações: " + nEdu + "</li>" +
    "<li><b>■</b>Competências: " + nSki + " | Objetivo: " + temObj + "</li>";
}

/* ===== ANIMAÇÕES CF via JS ===== */
let _ultModeloCF = "", _ultCorCF = "", _toastTimerCF = null;

function cfToast(msg){
  let el = document.getElementById("cf-toast");
  if(!el){
    el = document.createElement("div");
    el.id = "cf-toast";
    el.setAttribute("role", "status");
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("mostrar");
  clearTimeout(_toastTimerCF);
  _toastTimerCF = setTimeout(() => el.classList.remove("mostrar"), 2200);
}

function cfAnimaFolha(modelo, cor){
  if(modelo === _ultModeloCF && cor === _ultCorCF) return;
  _ultModeloCF = modelo; _ultCorCF = cor;
  const folha = document.getElementById("folha");
  if(!folha) return;
  folha.classList.remove("animar");
  void folha.offsetWidth; // reinicia a animação
  folha.classList.add("animar");
  const barra = document.querySelector(".barra-preview");
  if(barra){
    barra.classList.remove("piscar");
    void barra.offsetWidth;
    barra.classList.add("piscar");
  }
}

function initAnimacoesCF(){
  if(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // 1) Reveal on scroll: hero, painéis, folha, rodapé
  const alvos = document.querySelectorAll(".hero-bloco, .painel-form, .painel-preview, .folha, .barra-preview, .rod-col, .topo, .faixa-topo");
  alvos.forEach((el, i) => {
    el.classList.add("revelar");
    el.style.transitionDelay = Math.min((i % 4) * 70, 210) + "ms";
  });
  if("IntersectionObserver" in window){
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if(e.isIntersecting){ e.target.classList.add("visivel"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    alvos.forEach(el => obs.observe(el));
  } else {
    alvos.forEach(el => el.classList.add("visivel"));
  }

  // 2) Marca blocos novos para animar entrada
  const marcaNovos = () => {
    document.querySelectorAll("#lista-exp .bloco-dinamico, #lista-edu .bloco-dinamico").forEach(b => {
      if(!b.dataset.animado){
        b.dataset.animado = "1";
        b.classList.add("novo");
        setTimeout(() => b.classList.remove("novo"), 500);
      }
    });
  };
  new MutationObserver(marcaNovos).observe(document.body, { childList: true, subtree: true });
  marcaNovos();

  // 3) Toast de boas-vindas
  setTimeout(() => cfToast("■ CF pronto — digite e veja ao vivo"), 600);
}

// avisos com toast (sem mudar a lógica principal)
const _carregarExemploOrig = carregarExemplo;
carregarExemplo = function(){ _carregarExemploOrig(); cfToast("⚡ Exemplo carregado"); };
const _imprimirOrig = imprimir;
imprimir = function(){ cfToast("⬇ Gerando PDF A4…"); setTimeout(_imprimirOrig, 350); };

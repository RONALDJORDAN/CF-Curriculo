// ===== CF SITE — menu, reveal, slider, contadores, pix =====
function abrirPix(){
  const m = document.getElementById("pix-modal");
  if(!m) return;
  m.classList.add("aberto");
  m.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function fecharPix(){
  const m = document.getElementById("pix-modal");
  if(!m) return;
  m.classList.remove("aberto");
  m.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
function copiarPix(){
  const el = document.getElementById("pix-chave-txt");
  const txt = el ? el.textContent.trim() : "";
  const done = () => { alert("Chave PIX copiada 💛 Deus abençoe!"); };
  if(navigator.clipboard && txt) navigator.clipboard.writeText(txt).then(done).catch(done);
  else done();
}
(function(){
  "use strict";

  const topo = document.getElementById("site-topo");
  const menuBtn = document.getElementById("menu-btn");
  const menu = document.getElementById("site-menu");
  addEventListener("scroll", () => {
    if(topo) topo.classList.toggle("com-sombra", scrollY > 8);
  }, { passive: true });
  if(menuBtn && menu){
    menuBtn.addEventListener("click", () => {
      const aberto = menu.classList.toggle("aberto");
      menuBtn.textContent = aberto ? "✕" : "☰";
    });
    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      menu.classList.remove("aberto");
      menuBtn.textContent = "☰";
    }));
  }

  const alvos = document.querySelectorAll(".revelar");
  if("IntersectionObserver" in window){
    const obs = new IntersectionObserver((ents) => {
      ents.forEach(e => { if(e.isIntersecting){ e.target.classList.add("visivel"); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    alvos.forEach(el => obs.observe(el));
  } else {
    alvos.forEach(el => el.classList.add("visivel"));
  }

  // Menu ativo pela página atual (site multi-página: index/modelos/sobre/criar)
  if(menu){
    const pag = ((location.pathname.split("/").pop() || "index.html").split("?")[0] || "index.html").toLowerCase();
    const normaliza = (h) => (h || "").split("?")[0].split("#")[0].split("/").pop().toLowerCase();
    menu.querySelectorAll("a").forEach(a => {
      const href = normaliza(a.getAttribute("href"));
      if(!href || href.startsWith("#")) return;
      const ehIndex = (pag === "" || pag === "index.html") && (href === "" || href === "index.html");
      a.classList.toggle("ativo", href === pag || ehIndex);
    });
  }
  // Scrollspy só se houver âncoras internas (#id) no menu
  const linksHash = menu ? Array.from(menu.querySelectorAll('a[href^="#"]')) : [];
  if(linksHash.length && "IntersectionObserver" in window){
    const mapa = {};
    linksHash.forEach(a => { mapa[a.getAttribute("href").slice(1)] = a; });
    const obsSec = new IntersectionObserver((ents) => {
      ents.forEach(e => {
        if(e.isIntersecting && mapa[e.target.id]){
          linksHash.forEach(l => l.classList.remove("ativo"));
          mapa[e.target.id].classList.add("ativo");
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(mapa).forEach(id => { const s = document.getElementById(id); if(s) obsSec.observe(s); });
  }

  // ===== SLIDER de modelos =====
  const track = document.getElementById("slider-track");
  const prev = document.getElementById("slider-prev");
  const next = document.getElementById("slider-next");
  const dotsBox = document.getElementById("slider-dots");
  const pos = document.getElementById("slider-pos");
  if(track){
    const vis = () => Array.from(track.children).filter(c => getComputedStyle(c).display !== "none");
    let idx = 0, timer = null;
    const porVista = () => innerWidth <= 640 ? 1 : innerWidth <= 1000 ? 2 : 3;
    const maxIdx = () => Math.max(0, vis().length - porVista());
    const cardW = () => { const v = vis(); return v.length ? v[0].getBoundingClientRect().width + 16 : 0; };

    function desenhaDots(){
      dotsBox.innerHTML = "";
      for(let i = 0; i <= maxIdx(); i++){
        const b = document.createElement("button");
        b.setAttribute("aria-label", "Ir para " + (i+1));
        if(i === idx) b.classList.add("ativo");
        b.addEventListener("click", () => { idx = i; move(); reinicia(); });
        dotsBox.appendChild(b);
      }
    }
    function move(){
      idx = Math.max(0, Math.min(idx, maxIdx()));
      track.style.transform = "translateX(" + (-idx * cardW()) + "px)";
      Array.from(dotsBox.children).forEach((d, i) => d.classList.toggle("ativo", i === idx));
      if(pos) pos.textContent = (idx+1) + " / " + (maxIdx()+1);
    }
    function reinicia(){
      clearInterval(timer);
      timer = setInterval(() => { idx = idx >= maxIdx() ? 0 : idx + 1; move(); }, 4000);
    }
    prev.addEventListener("click", () => { idx = idx <= 0 ? maxIdx() : idx - 1; move(); reinicia(); });
    next.addEventListener("click", () => { idx = idx >= maxIdx() ? 0 : idx + 1; move(); reinicia(); });
    track.parentElement.addEventListener("mouseenter", () => clearInterval(timer));
    track.parentElement.addEventListener("mouseleave", reinicia);
    addEventListener("keydown", (e) => {
      if(e.key === "ArrowLeft"){ idx = idx <= 0 ? maxIdx() : idx - 1; move(); }
      if(e.key === "ArrowRight"){ idx = idx >= maxIdx() ? 0 : idx + 1; move(); }
    });
    addEventListener("resize", () => { desenhaDots(); move(); });
    desenhaDots(); move(); reinicia();
  }

  // ===== VER MAIS (lista vertical, sem slider) =====
  const btnMais = document.getElementById("btn-ver-mais");
  if(btnMais){
    const devMsg = document.getElementById("dev-msg");
    btnMais.addEventListener("click", () => {
      const expandido = devMsg ? devMsg.hidden : true;
      if(devMsg) devMsg.hidden = !expandido;
      btnMais.textContent = expandido ? "Ver menos ↑" : "Ver mais ↓";
      if(expandido && devMsg) devMsg.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  // ===== GUIA qual modelo escolher (cor não importa: vale modelo + informações) =====
  // Pesquisa registrada em modelo/guia-por-area.md — fontes: Gupy/ATS, cronológico reverso, 1 coluna, 7-10s de leitura.
  const GUIA = {
    primeiro: { tit: "■ 1º EMPREGO — BEGE LIMPO OU COMPACTO (1 coluna)", txt: "Grandes empresas exigem: contato com LinkedIn + cidade/UF (filtro geográfico), objetivo com cargo exato (ATS descarta genérico), formação com instituição/ano (+ liderança como grêmio), experiências sem CLT (voluntariado, informal, acadêmico), Office/idiomas/cursos (Sebrae/Bradesco) e 3-5 soft skills. Espelhe as palavras do anúncio.", modelo: "bege-limpo", alt: "compacto", altNome: "Compacto" },
    estagio: { tit: "■ ESTÁGIO — COMPACTO OU CENTRAL (1 coluna)", txt: "Filtro: curso, instituição e previsão de conclusão no topo, mais Office/e-mail corporativo e conhecimentos básicos da área. Gupy lê de cima pra baixo: formação primeiro, depois cursos e projetos datados. Modelo compacto/central cabe tudo em 1 página e mantém a ordem que o ATS espera.", modelo: "compacto", alt: "central", altNome: "Central Clássico" },
    formal: { tit: "■ VAGA FORMAL / ADMINISTRATIVO — EXECUTIVO OU QUADRADO", txt: "Pesa: experiência em ordem cronológica reversa (cargo — empresa — mês/ano) com bullets ação+contexto+resultado e números, mais rotinas (documentos, planilhas, atendimento). Visual sóbrio transmite responsabilidade. Se a vaga usa ATS, prefira o Quadrado de 1 coluna; entrega direta aceita bem o Executivo.", modelo: "executivo", alt: "quadrado", altNome: "Quadrado Cheio" },
    vendas: { tit: "■ VENDAS / ATENDIMENTO — TOPO AMARELO OU FAIXA", txt: "Decide no número: metas batidas, conversão, ticket, clientes/semana e fidelização. Objetivo com perfil consultivo + área (varejo/serviços/B2B). O destaque no nome prende os 6 segundos iniciais, mas o que aprova são os resultados quantificados e as palavras-chave do anúncio.", modelo: "topo-amarelo", alt: "faixa", altNome: "Faixa Esquerda" },
    ti: { tit: "■ TI / SUPORTE — QUADRADO OU BEGE LIMPO (1 coluna, ATS-safe)", txt: "Filtro é técnico e literal: stack exata da vaga (ex: Python, SQL, AWS, Docker, Git, Scrum), projetos com link, certificações com emissor e ano. Evite 2 colunas, tabela, ícone e gráfico — embaralham o ATS. Seção Habilidades separada por vírgulas é o repositório de palavras-chave. Cronológico reverso com 3-5 bullets por cargo.", modelo: "quadrado", alt: "bege-limpo", altNome: "Bege Limpo" },
    academico: { tit: "■ ACADÊMICO — BEGE LIMPO OU CENTRAL (1 coluna)", txt: "Vale comprovação: formação completa (curso — instituição — ano), cursos complementares só os relevantes, idiomas com nível real, iniciação/projetos e certificações datadas. Título de seção padrão (Formação, Habilidades, Certificações). Sem foto, sem caixa de texto, PDF com texto selecionável e nome de arquivo profissional.", modelo: "bege-limpo", alt: "central", altNome: "Central Clássico" }
  };
  const guiaChips = document.querySelectorAll("#guia-chips .chip");
  if(guiaChips.length){
    guiaChips.forEach(ch => ch.addEventListener("click", () => {
      guiaChips.forEach(c => c.classList.remove("ativo"));
      ch.classList.add("ativo");
      const g = GUIA[ch.dataset.guia] || GUIA.primeiro;
      const tit = document.getElementById("guia-tit");
      const txt = document.getElementById("guia-txt");
      const usar = document.getElementById("guia-usar");
      const alt = document.getElementById("guia-alt");
      if(tit) tit.textContent = g.tit;
      if(txt) txt.textContent = g.txt;
      if(usar) usar.href = "criar.html?modelo=" + g.modelo;
      if(alt) alt.innerHTML = 'Alternativa: <a href="criar.html?modelo=' + g.alt + '">' + g.altNome + "</a>";
    }));
  }

  // ===== PRÉVIA REAL: renderiza o CV de exemplo em cada card =====
  // Primeiro emprego (bege-limpo/compacto/central): formação + cursos antes da experiência, sem CLT.
  function folhaExemplo(m, t){
    const primeiro = (m === "bege-limpo" || m === "compacto" || m === "central");
    const blocoFormacao = '<h5>■ FORMAÇÃO</h5>' +
      '<div class="item-edu"><b>Ensino Médio Completo</b><span>E.E. Central • 2023</span></div>';
    const blocoCursos = '<h5>■ CURSOS</h5>' +
      '<div class="item-edu"><b>Informática + Excel</b><span>Curso Livre • 2024</span></div>' +
      '<div class="item-edu"><b>Atendimento ao Cliente</b><span>SENAI • 2024</span></div>';
    const blocoExpPrimeiro = '<h5>■ EXPERIÊNCIA</h5>' +
      '<div class="item-exp"><b>Voluntária — Festa Comunitária</b><span>2024</span><p>Organizei 200 cadastros com planilha, 100% sem erro.</p></div>';
    const blocoExpPadrao = '<h5>■ EXPERIÊNCIA</h5>' +
      '<div class="item-exp"><b>Auxiliar Administrativa — Comércio Central LTDA</b><span>2022 - 2024</span><p>Atendimento, planilhas e emissão de notas.</p></div>';
    const objetivoPrimeiro = '<h5>■ OBJETIVO</h5><p>Busco vaga como Auxiliar Administrativa. Organizada, domino Excel e aprendo rápido.</p>';
    // Modelo 3 compacto (ABNT): cargo almejado + texto semi-pronto
    const objetivoCompacto = '<h5>■ OBJETIVO</h5><p><b>Cargo almejado: Estágio Administrativo</b></p>' +
      '<p>Estou em busca de oportunidades como Estágio Administrativo na área Administrativa onde posso aplicar e expandir meus conhecimentos em Excel e Organização, contribuindo com resultados sólidos para a equipe.</p>';
    // Modelo 3 ordem completa: formação → experiência → cursos → projetos → técnicas → idiomas → outras → soft
    const blocoCompacto = '<h5>■ FORMAÇÃO ACADÊMICA</h5>' +
      '<div class="item-edu"><b>Administração — Cursando</b><span>Faculdade Central • previsão 12/2027</span></div>' +
      '<h5>■ EXPERIÊNCIA PROFISSIONAL</h5>' +
      '<div class="item-exp"><b>Monitora | Faculdade Central</b><span>2024</span><p>Recepcionei 100 visitantes e organizei cadastros em planilha.</p></div>' +
      '<h5>■ CURSOS E CERTIFICAÇÕES</h5>' +
      '<div class="item-edu"><b>Excel Básico</b><span>Fundação Bradesco - 03/2024</span></div>' +
      '<h5>■ PROJETOS APRESENTÁVEIS</h5>' +
      '<div class="item-exp"><b>Planilha de controle de estoque</b><p>Controle de entradas e saídas em Excel.</p></div>' +
      '<h5>■ HABILIDADES TÉCNICAS</h5>' +
      '<div><span class="tag">Excel</span><span class="tag">Word</span></div>' +
      '<h5>■ IDIOMAS</h5><p>Inglês — Básico</p>' +
      '<h5>■ OUTRAS HABILIDADES</h5><p>Digitação, Organização de arquivos</p>' +
      '<h5>■ HABILIDADES INTERPESSOAIS (SOFT SKILLS)</h5><p>Proatividade, Trabalho em equipe, Comunicação</p>';
    const objetivoPadrao = '<h5>■ RESUMO</h5><p>Profissional organizada com 3 anos de experiência em atendimento e rotinas administrativas.</p>';
    const topoCompacto = '<div class="cv-topo"><h2><b>ANA MARCIA</b></h2>' +
      '<p class="cv-contato">São Paulo / SP • (11) 99999-1234 • ana.marcia@email.com</p>' +
      '<p class="cv-links">linkedin.com/in/anamarcia</p></div>';
    const topoPadrao = '<div class="cv-topo"><h2>Ana Marcia</h2><h4>Auxiliar Administrativa</h4>' +
      '<p class="cv-contato">ana.marcia@email.com • (11) 99999-1234 • São Paulo / SP</p></div>';
    const objetivo = (m === "compacto") ? objetivoCompacto : (primeiro ? objetivoPrimeiro : null);
    return '<div class="folha mini-folha modelo-' + m + ' tema-' + t + '">' +
      (m === "compacto" ? topoCompacto : topoPadrao) +
      '<div class="cv-corpo"><div class="cv-col-principal">' +
        ((m === "compacto") ? objetivo + blocoCompacto : (primeiro ? objetivoPrimeiro + blocoFormacao + blocoCursos + blocoExpPrimeiro : objetivoPadrao + blocoExpPadrao +
        '<h5>■ FORMAÇÃO</h5>' +
        '<div class="item-edu"><b>Ensino Médio Completo</b><span>E.E. Central • 2019</span></div>')) +
      '</div><aside class="cv-lateral">' +
        '<h5>■ CONTATO</h5><p>ana.marcia@email.com<br>(11) 99999-1234</p>' +
        '<h5>■ HABILIDADES</h5><div><span class="tag">Excel</span><span class="tag">Vendas</span><span class="tag">Atend.</span></div>' +
      '</aside></div>' +
    '</div>';
  }
  document.querySelectorAll(".prev-wrap").forEach(w => {
    w.innerHTML = folhaExemplo(w.dataset.modelo || "quadrado", w.dataset.tema || "marrom");
    w.style.cursor = "zoom-in";
    w.title = "Clique para ampliar";
  });

  // ===== MODAL: visualização ampliada do modelo em tempo real =====
  const prevAlgum = document.querySelector(".prev-wrap");
  if(prevAlgum && !document.getElementById("cf-modal")){
    const modal = document.createElement("div");
    modal.className = "cf-modal";
    modal.id = "cf-modal";
    modal.innerHTML = '<div class="cf-modal-fundo"></div>' +
      '<div class="cf-modal-caixa" role="dialog" aria-modal="true">' +
        '<div class="cf-modal-topo"><b id="cf-modal-tit">Modelo</b><button class="x" aria-label="Fechar">✕ FECHAR</button></div>' +
        '<div class="cf-modal-corpo" id="cf-modal-corpo"></div>' +
        '<div class="cf-modal-rodape"><a class="btn btn-amarelo" id="cf-modal-usar" href="criar.html">Usar este modelo →</a><a class="btn btn-branco" id="cf-modal-ver" href="#" target="_blank" rel="noopener">⛶ Abrir completo</a></div>' +
      '</div>';
    document.body.appendChild(modal);
    const corpo = modal.querySelector("#cf-modal-corpo");
    const tit = modal.querySelector("#cf-modal-tit");
    const usar = modal.querySelector("#cf-modal-usar");
    const ver = modal.querySelector("#cf-modal-ver");
    const MAPA_PREVIA = { "bege-limpo": "modelo/primeiro-emprego-bege-limpo/preview.html", "executivo": "modelo/concorrer-vaga-executivo/preview.html", "compacto": "modelo/estagio-compacto/preview.html" };
    const fecha = () => { modal.classList.remove("aberto"); document.body.style.overflow = ""; };
    modal.querySelector(".cf-modal-fundo").addEventListener("click", fecha);
    modal.querySelector(".x").addEventListener("click", fecha);
    addEventListener("keydown", e => { if(e.key === "Escape") fecha(); });
  addEventListener("keydown", e => { if(e.key === "Escape" && typeof fecharPix === "function") fecharPix(); });
    document.querySelectorAll(".model-card, .mod-linha").forEach(card => {
      const prev = card.querySelector(".prev-wrap");
      if(!prev) return;
      prev.addEventListener("click", () => {
        const nome = ((card.querySelector(".info b") || card.querySelector(".mod-detalhes h3") || {}).textContent) || "Modelo";
        corpo.innerHTML = folhaExemplo(prev.dataset.modelo || "quadrado", prev.dataset.tema || "marrom");
        tit.textContent = "■ " + nome.toUpperCase();
        usar.href = "criar.html?modelo=" + (prev.dataset.modelo || "quadrado");
        if(ver) ver.href = MAPA_PREVIA[prev.dataset.modelo] || ("modelo/01-quadrado-cheio/preview.html");
        modal.classList.add("aberto");
        document.body.style.overflow = "hidden";
        corpo.scrollTop = 0;
      });
    });
  }

  // ===== FAQ sanfona =====
  document.querySelectorAll(".faq-item").forEach(item => {
    const btn = item.querySelector(".faq-q");
    if(btn) btn.addEventListener("click", () => {
      const estava = item.classList.contains("aberto");
      document.querySelectorAll(".faq-item.aberto").forEach(o => {
        o.classList.remove("aberto");
        o.querySelector(".faq-a").style.maxHeight = null;
      });
      if(!estava){
        item.classList.add("aberto");
        const a = item.querySelector(".faq-a");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  // ===== Voltar ao topo =====
  let btnTopo = document.getElementById("voltar-topo");
  if(!btnTopo){
    btnTopo = document.createElement("button");
    btnTopo.id = "voltar-topo";
    btnTopo.textContent = "↑";
    btnTopo.setAttribute("aria-label", "Voltar ao topo");
    document.body.appendChild(btnTopo);
  }
  addEventListener("scroll", () => btnTopo.classList.toggle("mostrar", scrollY > 600), { passive: true });
  btnTopo.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

  // ===== Tilt nos cards de benefício (60fps via rAF) =====
  if(matchMedia("(hover:hover)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches){
    document.querySelectorAll(".ben").forEach(card => {
      let raf = null, tx = 0, ty = 0;
      const aplica = () => {
        raf = null;
        card.style.transform = "translate3d(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px,0)";
      };
      card.addEventListener("mousemove", e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        tx = x * 8; ty = y * 8;
        if(!raf) raf = requestAnimationFrame(aplica);
      });
      card.addEventListener("mouseleave", () => {
        if(raf) cancelAnimationFrame(raf);
        raf = null; tx = 0; ty = 0;
        card.style.transform = "";
      });
    });
  }

  // ===== Contadores 60fps via rAF (só quando visível) =====
  const animaContador = (el) => {
    const alvo = parseInt(el.dataset.contar, 10) || 0;
    const dur = 1200;
    let ini = null;
    const passo = (t) => {
      if(!ini) ini = t;
      const p = Math.min(1, (t - ini) / dur);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(alvo * ease);
      if(p < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  };
  if("IntersectionObserver" in window){
    const obsNum = new IntersectionObserver((ents) => {
      ents.forEach(e => {
        if(e.isIntersecting){ animaContador(e.target); obsNum.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll("[data-contar]").forEach(el => obsNum.observe(el));
  } else {
    document.querySelectorAll("[data-contar]").forEach(animaContador);
  }
})();

// ===== CF SITE — menu, reveal, slider, contadores =====
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

  const secs = ["inicio","modelos","projeto","sobre"];
  const links = {};
  secs.forEach(id => { links[id] = menu ? menu.querySelector('a[href="#'+id+'"]') : null; });
  const obsSec = new IntersectionObserver((ents) => {
    ents.forEach(e => {
      if(e.isIntersecting && links[e.target.id]){
        Object.values(links).forEach(l => l && l.classList.remove("ativo"));
        links[e.target.id].classList.add("ativo");
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  secs.forEach(id => { const s = document.getElementById(id); if(s) obsSec.observe(s); });

  // ===== SLIDER de modelos =====
  const track = document.getElementById("slider-track");
  const prev = document.getElementById("slider-prev");
  const next = document.getElementById("slider-next");
  const dotsBox = document.getElementById("slider-dots");
  const pos = document.getElementById("slider-pos");
  if(track){
    const vis = () => Array.from(track.children).filter(c => !c.classList.contains("escondido"));
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

    // filtros por categoria (chips) — funcionam junto com o slider
    document.querySelectorAll(".chip").forEach(ch => ch.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach(c => c.classList.remove("ativo"));
      ch.classList.add("ativo");
      const f = ch.dataset.filtro || "todos";
      Array.from(track.children).forEach(card => {
        const cats = (card.dataset.cat || "").split(" ").filter(Boolean);
        card.classList.toggle("escondido", f !== "todos" && !cats.includes(f));
      });
      idx = 0; desenhaDots(); move(); reinicia();
    }));
  }

  // ===== PRÉVIA REAL: renderiza o CV de exemplo em cada card =====
  function folhaExemplo(m, t){
    return '<div class="folha mini-folha modelo-' + m + ' tema-' + t + '">' +
      '<div class="cv-topo"><h2>Ana Marcia</h2><h4>Auxiliar Administrativa</h4>' +
      '<p class="cv-contato">ana.marcia@email.com • (11) 99999-1234 • São Paulo / SP</p></div>' +
      '<div class="cv-corpo"><div class="cv-col-principal">' +
        '<h5>■ RESUMO</h5><p>Profissional organizada com 3 anos de experiência em atendimento e rotinas administrativas.</p>' +
        '<h5>■ EXPERIÊNCIA</h5>' +
        '<div class="item-exp"><b>Auxiliar Administrativa — Comércio Central LTDA</b><span>2022 - 2024</span><p>Atendimento, planilhas e emissão de notas.</p></div>' +
        '<h5>■ FORMAÇÃO</h5>' +
        '<div class="item-edu"><b>Ensino Médio Completo</b><span>E.E. Central • 2019</span></div>' +
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
        '<div class="cf-modal-rodape"><a class="btn btn-amarelo" id="cf-modal-usar" href="criar.html">Usar este modelo →</a></div>' +
      '</div>';
    document.body.appendChild(modal);
    const corpo = modal.querySelector("#cf-modal-corpo");
    const tit = modal.querySelector("#cf-modal-tit");
    const usar = modal.querySelector("#cf-modal-usar");
    const fecha = () => { modal.classList.remove("aberto"); document.body.style.overflow = ""; };
    modal.querySelector(".cf-modal-fundo").addEventListener("click", fecha);
    modal.querySelector(".x").addEventListener("click", fecha);
    addEventListener("keydown", e => { if(e.key === "Escape") fecha(); });
    document.querySelectorAll(".model-card").forEach(card => {
      const prev = card.querySelector(".prev-wrap");
      if(!prev) return;
      prev.addEventListener("click", () => {
        const nome = (card.querySelector(".info b") || {}).textContent || "Modelo";
        corpo.innerHTML = folhaExemplo(prev.dataset.modelo || "quadrado", prev.dataset.tema || "marrom");
        tit.textContent = "■ " + nome.toUpperCase();
        usar.href = "criar.html?modelo=" + (prev.dataset.modelo || "quadrado");
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

  // ===== Tilt nos cards de benefício =====
  if(matchMedia("(hover:hover)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches){
    document.querySelectorAll(".ben").forEach(card => {
      card.addEventListener("mousemove", e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = "translate(" + (x*8).toFixed(1) + "px," + (y*8).toFixed(1) + "px)";
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  document.querySelectorAll("[data-contar]").forEach(el => {
    const alvo = parseInt(el.dataset.contar, 10) || 0;
    let cur = 0;
    const passo = Math.max(1, Math.round(alvo / 30));
    const t = setInterval(() => {
      cur += passo;
      if(cur >= alvo){ cur = alvo; clearInterval(t); }
      el.textContent = cur;
    }, 50);
  });
})();

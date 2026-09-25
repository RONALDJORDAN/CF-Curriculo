import React from 'react'
import { createRoot } from 'react-dom/client'
import Faq, { FAQ_PADRAO } from './components/Faq.jsx'
import PixModal from './components/PixModal.jsx'
import { GuiaModelos, MiniFolha } from './components/SiteIslands.jsx'

// Mescla HTML + React: hidrata ilhas sem remover o HTML/vanilla.
// 1) Menu ativo por página + mobile (reforça o site.js vanilla)
// 2) Reveal on scroll
// 3) FAQ React onde houver <div id="react-faq">
// 4) Guia React onde houver <div id="react-guia">
// 5) Mini previas React onde houver .prev-wrap[data-modelo] vazio
// 6) PixModal global

function ativaMenu() {
  const menu = document.getElementById('site-menu')
  if (!menu) return
  const pag = ((location.pathname.split('/').pop() || 'index.html').split('?')[0] || 'index.html').toLowerCase()
  const norm = (h) => (h || '').split('?')[0].split('#')[0].split('/').pop().toLowerCase()
  menu.querySelectorAll('a').forEach((a) => {
    const href = norm(a.getAttribute('href'))
    if (!href || href.startsWith('#')) return
    const ehIndex = (pag === '' || pag === 'index.html') && (href === '' || href === 'index.html')
    if (href === pag || ehIndex) a.classList.add('ativo')
  })
}

function initReveal() {
  const alvos = document.querySelectorAll('.revelar:not(.visivel)')
  if (!('IntersectionObserver' in window)) { alvos.forEach((el) => el.classList.add('visivel')); return }
  const obs = new IntersectionObserver((ents) => {
    ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visivel'); obs.unobserve(e.target) } })
  }, { threshold: 0.12 })
  alvos.forEach((el) => obs.observe(el))
}

function mount(id, el) {
  const n = document.getElementById(id)
  if (!n) return
  createRoot(n).render(el)
}

ativaMenu()
initReveal()

// FAQ: se a página tem <div id="react-faq">, renderiza React e esconde fallback vanilla próximo
mount('react-faq', <Faq itens={FAQ_PADRAO} />)

// Guia modelos (modelos.html)
mount('react-guia', <GuiaModelos />)

// Pix modal global (todas as páginas)
{
  const holder = document.createElement('div')
  holder.id = 'react-pix'
  document.body.appendChild(holder)
  createRoot(holder).render(<PixModal />)
}

// Mini folhas: hidrata cada .prev-wrap com React (mantém link "Usar este" do HTML)
document.querySelectorAll('.prev-wrap[data-modelo]').forEach((w) => {
  if (w.childElementCount > 0) return // vanilla já preencheu
  const root = document.createElement('div')
  w.appendChild(root)
  createRoot(root).render(<MiniFolha modelo={w.dataset.modelo || 'quadrado'} tema={w.dataset.tema || 'marrom'} />)
})

// Botões vanilla "Dar aquele trocado" -> abre modal React
document.querySelectorAll('[onclick*="abrirPix"]').forEach((b) => {
  if (b.dataset.reactPix) return
  b.dataset.reactPix = '1'
  b.addEventListener('click', (e) => {
    e.preventDefault()
    window.dispatchEvent(new CustomEvent('cf:abrir-pix'))
  })
})

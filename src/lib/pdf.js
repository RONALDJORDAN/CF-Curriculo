// CF — PDF melhorado: html2canvas + jsPDF, com fallback para window.print (A4)
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export async function exportarPDFFolha(folhaEl, nomeArquivo = 'curriculo.pdf', onStatus = () => {}) {
  if (!folhaEl) throw new Error('Folha não encontrada')
  onStatus('gerando')
  try {
    const canvas = await html2canvas(folhaEl, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    })
    const img = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    const pageW = 210
    const pageH = 297
    const imgW = pageW
    const imgH = (canvas.height * imgW) / canvas.width
    let y = 0
    let heightLeft = imgH
    pdf.addImage(img, 'PNG', 0, y, imgW, imgH)
    heightLeft -= pageH
    while (heightLeft > 0) {
      y -= pageH
      pdf.addPage()
      pdf.addImage(img, 'PNG', 0, y, imgW, imgH)
      heightLeft -= pageH
    }
    pdf.save(nomeArquivo)
    onStatus('ok')
    return true
  } catch (e) {
    console.warn('[CF] html2canvas falhou, usando print:', e)
    onStatus('fallback')
    window.print()
    return false
  }
}

export function nomeArquivoPDF(nome) {
  const base = (nome || 'curriculo').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w]+/g, '_').slice(0, 40) || 'curriculo'
  return `Curriculo_${base}.pdf`
}

/**
 * Captures each top-level child of the given element as its own canvas and
 * lays them out into an A4 PDF, starting a new page whenever a section
 * wouldn't fit in the remaining space — so a card/table is never sliced in
 * half by a naive full-page pixel-row cut.
 */
export async function generateSectionedPdf(targetId: string): Promise<Blob> {
  const target = document.getElementById(targetId)
  if (!target) throw new Error(`No element found with id "${targetId}"`)

  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas-pro'),
    import('jspdf'),
  ])

  // Skip sections with no rendered content (0 width/height) — e.g. a chart
  // grid whose children all bailed out on missing data. Capturing one would
  // produce an empty/invalid PNG that crashes jsPDF's addImage.
  const sections = Array.from(target.children).filter(
    (el): el is HTMLElement => el instanceof HTMLElement && el.offsetWidth > 0 && el.offsetHeight > 0
  )
  const captureTargets = sections.length > 0 ? sections : [target]

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 24
  const gap = 12
  const imgWidth = pageWidth - margin * 2
  const availableHeight = pageHeight - margin * 2

  let cursorY = margin

  for (const section of captureTargets) {
    const canvas = await html2canvas(section, {
      backgroundColor: '#FFFFFF',
      scale: 2,
      useCORS: true,
    })
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    // JPEG, not PNG: this is text/chart/table content, not photography, so
    // lossy compression at high quality is visually indistinguishable but
    // 5-10x smaller — a real multi-section report at scale:2 PNG can blow
    // past a 15MB email-attachment limit; JPEG keeps it well under.
    const imgData = canvas.toDataURL('image/jpeg', 0.92)

    // Move to a fresh page if this section won't fit in what's left —
    // unless we're already at the top of a fresh page.
    if (cursorY > margin && cursorY + Math.min(imgHeight, availableHeight) > pageHeight - margin) {
      pdf.addPage()
      cursorY = margin
    }

    if (imgHeight <= availableHeight) {
      pdf.addImage(imgData, 'JPEG', margin, cursorY, imgWidth, imgHeight)
      cursorY += imgHeight + gap
    } else {
      // Single section taller than one page (e.g. a very long table) —
      // slice just this section across pages; every other section still
      // stays intact.
      let offset = 0
      let remaining = imgHeight
      pdf.addImage(imgData, 'JPEG', margin, margin - offset, imgWidth, imgHeight)
      remaining -= availableHeight
      while (remaining > 0) {
        offset += availableHeight
        pdf.addPage()
        pdf.addImage(imgData, 'JPEG', margin, margin - offset, imgWidth, imgHeight)
        remaining -= availableHeight
      }
      cursorY = pageHeight // force the next section onto a new page
    }
  }

  return pdf.output('blob')
}

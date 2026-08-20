'use client'

import { useState } from 'react'
import { useToast } from '@/context/ToastContext'
import headerStyles from '@/components/shared/Header/Header.module.css'

interface ExportPdfButtonProps {
  /** DOM id of the element to capture — must wrap the content to export. */
  targetId: string
  /** File name without extension. */
  fileName: string
  label?: string
  className?: string
}

export default function ExportPdfButton({
  targetId,
  fileName,
  label = 'Export PDF',
  className = headerStyles.btnGhost,
}: ExportPdfButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { showToast } = useToast()

  const handleExport = async () => {
    const target = document.getElementById(targetId)
    if (!target || isExporting) return

    setIsExporting(true)
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas-pro'),
        import('jspdf'),
      ])

      // Capture each top-level section separately (rather than one flat
      // screenshot of the whole page) so pagination can keep a card/table
      // intact instead of slicing straight through it at an arbitrary pixel
      // row — e.g. splitting a KPI card's numbers from its caption text.
      const sections = Array.from(target.children).filter(
        (el): el is HTMLElement => el instanceof HTMLElement
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
        const imgData = canvas.toDataURL('image/png')

        // Move to a fresh page if this section won't fit in what's left —
        // unless we're already at the top of a fresh page.
        if (cursorY > margin && cursorY + Math.min(imgHeight, availableHeight) > pageHeight - margin) {
          pdf.addPage()
          cursorY = margin
        }

        if (imgHeight <= availableHeight) {
          pdf.addImage(imgData, 'PNG', margin, cursorY, imgWidth, imgHeight)
          cursorY += imgHeight + gap
        } else {
          // Single section taller than one page (e.g. a very long table) —
          // slice just this section across pages; every other section still
          // stays intact.
          let offset = 0
          let remaining = imgHeight
          pdf.addImage(imgData, 'PNG', margin, margin - offset, imgWidth, imgHeight)
          remaining -= availableHeight
          while (remaining > 0) {
            offset += availableHeight
            pdf.addPage()
            pdf.addImage(imgData, 'PNG', margin, margin - offset, imgWidth, imgHeight)
            remaining -= availableHeight
          }
          cursorY = pageHeight // force the next section onto a new page
        }
      }

      pdf.save(`${fileName}.pdf`)
    } catch (err) {
      console.error(err)
      showToast('Failed to export PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button className={className} onClick={handleExport} disabled={isExporting}>
      {isExporting ? 'Exporting…' : label}
    </button>
  )
}

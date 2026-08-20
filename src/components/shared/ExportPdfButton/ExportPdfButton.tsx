'use client'

import { useState } from 'react'
import { useToast } from '@/context/ToastContext'
import headerStyles from '@/components/shared/Header/Header.module.css'
import { generateSectionedPdf } from '@/utils/pdf-export'

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
    if (isExporting) return

    setIsExporting(true)
    try {
      const blob = await generateSectionedPdf(targetId)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${fileName}.pdf`
      link.click()
      URL.revokeObjectURL(url)
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

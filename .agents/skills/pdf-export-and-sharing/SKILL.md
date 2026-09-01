---
name: pdf-export-and-sharing
description: >-
  Guide for generating multi-page sectioned A4 PDFs via html2canvas-pro and jsPDF and sharing reports with multipart file uploads in Pythia 2.0.
---

# PDF Export & Investor Sharing Guide

This guide outlines generating clean, multi-page sectioned A4 PDFs from UI elements and sending them via email to investors or stakeholders.

## Core Files & Locations

- **PDF Generation Utility**: [`src/utils/pdf-export.ts`](file:///home/vikalp/workspaces/inx/pythia/Pythia2.0-frontend1/src/utils/pdf-export.ts) (`generateSectionedPdf`)
- **Query / API**: [`src/queries/owner-roi.ts`](file:///home/vikalp/workspaces/inx/pythia/Pythia2.0-frontend1/src/queries/owner-roi.ts) (`shareRoiAttributionPdf`)
- **Sharing Schema**: [`src/schemas/investor-share.ts`](file:///home/vikalp/workspaces/inx/pythia/Pythia2.0-frontend1/src/schemas/investor-share.ts) (`shareWithInvestorSchema`)
- **Components**:
  - `ExportPdfButton`: Triggers client-side PDF download.
  - `ShareWithInvestorButton`: Opens modal, generates PDF blob, and submits multipart form to backend.

---

## Non-Breaking Sectioned PDF Generation

Standard full-page canvas capturing often slices charts, text lines, and table rows in half across page breaks. `generateSectionedPdf` solves this:

1. **Top-Level Child Partitioning**: Inspects `targetElement.children`.
2. **Dimension Filtering**: Ignores empty or collapsed containers (`offsetWidth > 0 && offsetHeight > 0`).
3. **JPEG Compression**: Uses `image/jpeg` with quality `0.92` rather than lossless PNG, reducing file size by 5–10x (keeping email attachments under 15MB limits).
4. **Smart Page Break Calculation**:
   - If the next section fits in the remaining space on current page, it is appended.
   - If not, a new page is added (`pdf.addPage()`) before drawing the section.
   - Long tables exceeding a full page height are sliced gracefully across consecutive pages.

```ts
import { generateSectionedPdf } from '@/utils/pdf-export'

async function handleExport() {
  const pdfBlob = await generateSectionedPdf('roi-report-container')
  const url = URL.createObjectURL(pdfBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = `roi-attribution-report-${Date.now()}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
```

---

## Multipart PDF Sharing via Axios

When sending the generated PDF to backend API (`POST /roi/attribution/share`):

```ts
export async function shareRoiAttributionPdf({
  token,
  toEmail,
  note,
  senderName,
  pdfFile,
}: ShareRoiAttributionPdfParams) {
  const form = new FormData()
  form.append('to_email', toEmail)
  if (note) form.append('note', note)
  if (senderName) form.append('sender_name', senderName)
  form.append('pdf', pdfFile, 'report.pdf')

  // Unset Content-Type so browser sets boundary automatically
  const { data } = await pythia2Client.post(PYTHIA_2_API.roi.shareWithInvestor, form, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': undefined,
    },
  })
  return data
}
```


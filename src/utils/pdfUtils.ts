import { PDFDocument } from 'pdf-lib'

interface PDFData {
  data: ArrayBuffer
  selectedPages: number[]
}

export async function mergePDFDocuments(pdfDataList: PDFData[]): Promise<ArrayBuffer> {
  const mergedPdf = await PDFDocument.create()

  for (const { data, selectedPages } of pdfDataList) {
    if (selectedPages.length === 0) continue

    const sourcePdf = await PDFDocument.load(data)
    const copiedPages = await mergedPdf.copyPages(sourcePdf, selectedPages)
    
    for (const page of copiedPages) {
      mergedPdf.addPage(page)
    }
  }

  const pdfBytes = await mergedPdf.save()
  return pdfBytes.buffer as ArrayBuffer
}


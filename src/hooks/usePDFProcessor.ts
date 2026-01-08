import { useState, useCallback } from 'react'
import * as pdfjs from 'pdfjs-dist'
import { mergePDFDocuments } from '../utils/pdfUtils'

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

export interface PageThumbnail {
  pageIndex: number
  dataUrl: string
  width: number
  height: number
}

export interface PDFDocument {
  id: string
  name: string
  pageCount: number
  thumbnails: PageThumbnail[]
  selectedPages: number[]
  data: ArrayBuffer
}

export interface LoadingProgress {
  currentPage: number
  totalPages: number
  fileName: string
}

export function usePDFProcessor() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState<LoadingProgress | null>(null)

  const generateThumbnail = async (
    page: pdfjs.PDFPageProxy,
    pageIndex: number
  ): Promise<PageThumbnail> => {
    const scale = 0.3
    const viewport = page.getViewport({ scale })
    
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.width = viewport.width
    canvas.height = viewport.height

    await page.render({
      canvasContext: context,
      viewport,
      canvas,
    }).promise

    return {
      pageIndex,
      dataUrl: canvas.toDataURL('image/jpeg', 0.7),
      width: viewport.width,
      height: viewport.height,
    }
  }

  const loadPDF = useCallback(async (file: File): Promise<PDFDocument | null> => {
    try {
      setIsProcessing(true)
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjs.getDocument({ data: arrayBuffer.slice(0) }).promise
      
      // Set initial progress
      setProgress({ currentPage: 0, totalPages: pdf.numPages, fileName: file.name })
      
      const thumbnails: PageThumbnail[] = []
      for (let i = 0; i < pdf.numPages; i++) {
        // Update progress for each page
        setProgress({ currentPage: i + 1, totalPages: pdf.numPages, fileName: file.name })
        
        const page = await pdf.getPage(i + 1)
        const thumbnail = await generateThumbnail(page, i)
        thumbnails.push(thumbnail)
      }

      return {
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        pageCount: pdf.numPages,
        thumbnails,
        selectedPages: Array.from({ length: pdf.numPages }, (_, i) => i),
        data: arrayBuffer,
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error loading PDF:', error)
      }
      return null
    } finally {
      setIsProcessing(false)
      setProgress(null)
    }
  }, [])

  const mergePDFs = useCallback(async (documents: PDFDocument[]): Promise<Blob | null> => {
    if (documents.length === 0) return null

    try {
      setIsProcessing(true)
      const pdfData = documents.map(doc => ({
        data: doc.data,
        selectedPages: doc.selectedPages,
      }))
      
      const mergedPdfBytes = await mergePDFDocuments(pdfData)
      return new Blob([mergedPdfBytes], { type: 'application/pdf' })
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error merging PDFs:', error)
      }
      return null
    } finally {
      setIsProcessing(false)
    }
  }, [])

  return {
    loadPDF,
    mergePDFs,
    isProcessing,
    progress,
  }
}


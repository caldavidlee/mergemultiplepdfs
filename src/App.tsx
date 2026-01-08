import { useState, useCallback } from 'react'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { DropZone } from './components/DropZone'
import { PDFItem } from './components/PDFItem'
import { MergeButton } from './components/MergeButton'
import { PrivacyNotice } from './components/PrivacyNotice'
import { usePDFProcessor, PDFDocument } from './hooks/usePDFProcessor'
import styles from './App.module.css'

function App() {
  const [documents, setDocuments] = useState<PDFDocument[]>([])
  const { loadPDF, mergePDFs, isProcessing } = usePDFProcessor()

  const handleFilesSelected = useCallback(async (files: File[]) => {
    const newDocs = await Promise.all(
      files.map(file => loadPDF(file))
    )
    setDocuments(prev => [...prev, ...newDocs.filter(Boolean) as PDFDocument[]])
  }, [loadPDF])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setDocuments(prev => {
        const oldIndex = prev.findIndex(d => d.id === active.id)
        const newIndex = prev.findIndex(d => d.id === over.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }, [])

  const handlePageToggle = useCallback((docId: string, pageIndex: number) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id !== docId) return doc
      const newSelectedPages = doc.selectedPages.includes(pageIndex)
        ? doc.selectedPages.filter(p => p !== pageIndex)
        : [...doc.selectedPages, pageIndex].sort((a, b) => a - b)
      return { ...doc, selectedPages: newSelectedPages }
    }))
  }, [])

  const handleSelectAllPages = useCallback((docId: string, selectAll: boolean) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id !== docId) return doc
      return {
        ...doc,
        selectedPages: selectAll 
          ? Array.from({ length: doc.pageCount }, (_, i) => i)
          : []
      }
    }))
  }, [])

  const handleRemoveDocument = useCallback((docId: string) => {
    setDocuments(prev => {
      // Securely clear the removed document's buffer
      const docToRemove = prev.find(d => d.id === docId)
      if (docToRemove) {
        new Uint8Array(docToRemove.data).fill(0)
      }
      return prev.filter(d => d.id !== docId)
    })
  }, [])

  // Securely clear all document buffers from memory
  const secureCleanup = useCallback(() => {
    documents.forEach(doc => {
      new Uint8Array(doc.data).fill(0)
    })
    setDocuments([])
  }, [documents])

  const handleMerge = useCallback(async () => {
    const result = await mergePDFs(documents)
    if (result) {
      const url = URL.createObjectURL(result)
      const a = document.createElement('a')
      a.href = url
      a.download = 'merged.pdf'
      a.click()
      URL.revokeObjectURL(url)
      // Securely clear all buffers after successful download
      secureCleanup()
    }
  }, [documents, mergePDFs, secureCleanup])

  const totalSelectedPages = documents.reduce(
    (sum, doc) => sum + doc.selectedPages.length,
    0
  )

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>PDF Merger</h1>
        <p className={styles.subtitle}>
          Combine multiple PDFs into one. Everything runs in your browser.
        </p>
        <PrivacyNotice />
      </header>

      <main className={styles.main}>
        <DropZone onFilesSelected={handleFilesSelected} disabled={isProcessing} />

        {documents.length > 0 && (
          <>
            <div className={styles.listHeader}>
              <span className={styles.listCount}>
                {documents.length} document{documents.length !== 1 ? 's' : ''} • {totalSelectedPages} page{totalSelectedPages !== 1 ? 's' : ''} selected
              </span>
              <button 
                className={styles.clearButton}
                onClick={secureCleanup}
              >
                Clear all
              </button>
            </div>

            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={documents.map(d => d.id)} strategy={verticalListSortingStrategy}>
                <div className={styles.list}>
                  {documents.map(doc => (
                    <PDFItem
                      key={doc.id}
                      document={doc}
                      onPageToggle={handlePageToggle}
                      onSelectAll={handleSelectAllPages}
                      onRemove={handleRemoveDocument}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <MergeButton
              onClick={handleMerge}
              disabled={totalSelectedPages === 0 || isProcessing}
              isProcessing={isProcessing}
              pageCount={totalSelectedPages}
            />
          </>
        )}
      </main>

      <footer className={styles.footer}>
        <p>No data is sent to any server. Your files stay on your device.</p>
        <a 
          href="https://github.com/caldavidlee/mergemultiplepdfs" 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.githubLink}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span>Open source — verify our code</span>
        </a>
      </footer>
    </div>
  )
}

export default App


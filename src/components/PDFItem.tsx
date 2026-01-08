import { memo, useMemo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PDFDocument } from '../hooks/usePDFProcessor'
import { PageThumbnail } from './PageThumbnail'
import styles from './PDFItem.module.css'

interface PDFItemProps {
  document: PDFDocument
  onPageToggle: (docId: string, pageIndex: number) => void
  onSelectAll: (docId: string, selectAll: boolean) => void
  onRemove: (docId: string) => void
}

export const PDFItem = memo(function PDFItem({ document, onPageToggle, onSelectAll, onRemove }: PDFItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: document.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const allSelected = document.selectedPages.length === document.pageCount
  const noneSelected = document.selectedPages.length === 0
  
  // O(1) lookup instead of O(n) for large documents
  const selectedSet = useMemo(() => new Set(document.selectedPages), [document.selectedPages])

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.item} ${isDragging ? styles.dragging : ''}`}
    >
      <div className={styles.header}>
        <button className={styles.dragHandle} {...attributes} {...listeners}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="6" r="1.5" />
            <circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" />
            <circle cx="15" cy="18" r="1.5" />
          </svg>
        </button>
        <div className={styles.info}>
          <h3 className={styles.name} title={document.name}>
            {document.name}
          </h3>
          <span className={styles.meta}>
            {document.selectedPages.length} of {document.pageCount} pages selected
          </span>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.selectButton}
            onClick={() => onSelectAll(document.id, noneSelected || !allSelected)}
          >
            {allSelected ? 'Deselect all' : 'Select all'}
          </button>
          <button
            className={styles.removeButton}
            onClick={() => onRemove(document.id)}
            aria-label="Remove document"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
      <div className={styles.thumbnails}>
        {document.thumbnails.map((thumb, idx) => (
          <PageThumbnail
            key={idx}
            thumbnail={thumb}
            isSelected={selectedSet.has(thumb.pageIndex)}
            onToggle={() => onPageToggle(document.id, thumb.pageIndex)}
          />
        ))}
      </div>
    </div>
  )
})


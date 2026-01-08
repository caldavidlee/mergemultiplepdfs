import { PageThumbnail as PageThumbnailType } from '../hooks/usePDFProcessor'
import styles from './PageThumbnail.module.css'

interface PageThumbnailProps {
  thumbnail: PageThumbnailType
  isSelected: boolean
  onToggle: () => void
}

export function PageThumbnail({ thumbnail, isSelected, onToggle }: PageThumbnailProps) {
  return (
    <button
      className={`${styles.thumbnail} ${isSelected ? styles.selected : ''}`}
      onClick={onToggle}
      type="button"
      aria-pressed={isSelected}
    >
      <img
        src={thumbnail.dataUrl}
        alt={`Page ${thumbnail.pageIndex + 1}`}
        className={styles.image}
      />
      <span className={styles.pageNumber}>{thumbnail.pageIndex + 1}</span>
      <div className={styles.checkbox}>
        {isSelected && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
    </button>
  )
}


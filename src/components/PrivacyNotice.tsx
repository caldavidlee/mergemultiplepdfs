import styles from './PrivacyNotice.module.css'

export function PrivacyNotice() {
  return (
    <div className={styles.notice}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <span>Your files never leave your device</span>
    </div>
  )
}


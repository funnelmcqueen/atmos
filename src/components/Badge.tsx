/** Neutral pill for the verified and mortgage flags. */
export function Badge({ children, tone }: { children: React.ReactNode; tone?: 'accent' }) {
  return <span className={`badge${tone === 'accent' ? ' badge--accent' : ''}`}>{children}</span>
}

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isLocale, t } from '@/messages/sq'
import '@/styles/frontend.css'

/**
 * Locale segment for the public site. Validates the prefix (docs/07 — every
 * public route is /[locale]/...) and renders the shared chrome. It does not
 * render <html>; that stays in the (frontend) root layout.
 *
 * Only sq and en route this session; anything else (including the deferred it
 * locale) 404s.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return (
    <div className="site">
      <header className="site-header">
        <Link href={`/${locale}`} className="site-header__brand">
          {t.brand}
        </Link>
        <nav className="site-header__nav">
          <Link href={`/${locale}/prona`}>{t.nav.properties}</Link>
          <Link href={`/${locale}/projekte`}>{t.nav.projects}</Link>
          <Link href={`/${locale}/kompani`}>{t.nav.companies}</Link>
        </nav>
      </header>
      {children}
    </div>
  )
}

import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React, { Suspense } from 'react'
import { fileURLToPath } from 'url'

import config from '@/payload.config'
import './styles.css'

/**
 * Still the Payload starter page. The real homepage is deliberately the last
 * thing built (docs/12-design.md), so this is only kept honest, not designed.
 *
 * The greeting is behind <Suspense> because it reads the request's cookies via
 * `payload.auth` — under cacheComponents that has to be an explicitly deferred
 * hole, otherwise one authentication check keeps the whole page from
 * prerendering.
 */
async function Greeting() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return user ? <h1>Welcome back, {user.email}</h1> : <h1>Welcome to your new project.</h1>
}

export default async function HomePage() {
  const payloadConfig = await config
  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`

  return (
    <div className="home">
      <div className="content">
        <picture>
          <source srcSet="https://raw.githubusercontent.com/payloadcms/payload/3.x/packages/ui/src/assets/payload-favicon.svg" />
          <Image
            alt="Payload Logo"
            height={65}
            src="https://raw.githubusercontent.com/payloadcms/payload/3.x/packages/ui/src/assets/payload-favicon.svg"
            width={65}
          />
        </picture>
        <Suspense fallback={<h1>Welcome.</h1>}>
          <Greeting />
        </Suspense>
        <div className="links">
          <a
            className="admin"
            href={payloadConfig.routes.admin}
            rel="noopener noreferrer"
            target="_blank"
          >
            Go to admin panel
          </a>
          <a
            className="docs"
            href="https://payloadcms.com/docs"
            rel="noopener noreferrer"
            target="_blank"
          >
            Documentation
          </a>
        </div>
      </div>
      <div className="footer">
        <p>Update this page by editing</p>
        <a className="codeLink" href={fileURL}>
          <code>app/(frontend)/page.tsx</code>
        </a>
      </div>
    </div>
  )
}

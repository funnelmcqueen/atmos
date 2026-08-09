/**
 * Creates or updates a single agent login.
 *
 * Separate from `pnpm seed` on purpose: the seed wipes and rebuilds the content
 * collections and deliberately leaves `users` alone, so an account you rely on
 * to log in must not depend on when the seed last ran.
 *
 *   pnpm create:agent
 *   pnpm create:agent agjent@atmos.al "Agjent Test" "+355 69 20 11 556"
 *
 * Idempotent. Re-running converges the name, phone and role on the values here
 * and leaves an existing password alone — so it will not lock you out of an
 * account you have already changed the password on.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'

const [emailArg, nameArg, phoneArg] = process.argv.slice(2)

const email = emailArg ?? 'agjent@atmos.al'
const name = nameArg ?? 'Agjent Test'
// A real number shape, with the country code. The public agent card and the
// WhatsApp link are both built from this, and an agent with no phone silently
// hides the sticky contact bar (docs/12).
const phone = phoneArg ?? '+355 69 20 11 556'
const password = process.env.AGENT_PASSWORD ?? 'agjent1234'

const run = async (): Promise<void> => {
  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
  })

  const user = existing.docs[0]
    ? await payload.update({
        collection: 'users',
        id: existing.docs[0].id,
        data: { name, phone, role: 'agent' },
      })
    : await payload.create({
        collection: 'users',
        data: { name, email, phone, password, role: 'agent' },
      })

  payload.logger.info(
    existing.docs[0]
      ? `Agjenti u përditësua: ${user.email} (id ${user.id}). Fjalëkalimi nuk u prek.`
      : `Agjenti u krijua: ${user.email} / ${password} (id ${user.id})`,
  )

  process.exit(0)
}

void run()

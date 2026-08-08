import type { Access, FieldAccess } from 'payload'

type Role = 'admin' | 'agent' | 'client'

const roleOf = (user: unknown): Role | null =>
  user && typeof user === 'object' && 'role' in user ? ((user as { role: Role }).role ?? null) : null

const idOf = (user: unknown): string | number | null =>
  user && typeof user === 'object' && 'id' in user ? ((user as { id: string | number }).id ?? null) : null

export const anyone: Access = () => true

export const isAdmin: Access = ({ req: { user } }) => roleOf(user) === 'admin'

export const isStaff: Access = ({ req: { user } }) => {
  const role = roleOf(user)
  return role === 'admin' || role === 'agent'
}

export const isAdminField: FieldAccess = ({ req: { user } }) => roleOf(user) === 'admin'
export const isStaffField: FieldAccess = ({ req: { user } }) => {
  const role = roleOf(user)
  return role === 'admin' || role === 'agent'
}

/**
 * Published documents are readable by anyone. Drafts are staff-only.
 * Payload merges this into the query, so the public API can never see a draft.
 */
export const publishedOrStaff: Access = ({ req: { user } }) => {
  const role = roleOf(user)
  if (role === 'admin' || role === 'agent') return true
  return { _status: { equals: 'published' } }
}

/**
 * Shared content: projects, companies, areas, articles.
 * Any agent may edit. Only an admin may publish.
 */
export const updateUnlessPublishing: Access = ({ req, data }) => {
  const role = roleOf(req.user)
  if (role === 'admin') return true
  if (role !== 'agent') return false
  if (data && '_status' in data && data._status === 'published') return false
  return true
}

/**
 * Owned listings: properties.
 *
 * Agents see the whole book but edit only what is assigned to them, and still
 * cannot publish. Returning a Where clause means Payload enforces it in the
 * query — an agent hitting the REST API directly gets the same answer as one
 * clicking around the admin.
 *
 * The `agent` field itself is admin-only to update (see Properties.ts),
 * otherwise an agent could reassign a listing to themselves and edit it.
 */
export const updateOwnListing: Access = ({ req, data }) => {
  const role = roleOf(req.user)
  if (role === 'admin') return true
  if (role !== 'agent') return false
  if (data && '_status' in data && data._status === 'published') return false

  const userId = idOf(req.user)
  if (!userId) return false
  return { agent: { equals: userId } }
}

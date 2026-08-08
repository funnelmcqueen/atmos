# Roles and permissions

Three roles. Agents have their own logins and manage their own book.

## Matrix

| | Client | Agent | Admin |
| --- | --- | --- | --- |
| View published content | yes | yes | yes |
| View drafts | no | yes | yes |
| View all properties, including other agents' | no | yes | yes |
| Edit a property assigned to them | no | yes | yes |
| Edit another agent's property | no | **no** | yes |
| Reassign a property to another agent | no | no | yes |
| Publish anything | no | **no** | yes |
| Edit projects, companies, areas, articles | no | yes | yes |
| Read listing requests and enquiries | no | yes | yes |
| Manage users and roles | no | no | yes |
| Delete anything | no | no | yes |

## How it's enforced

`updateOwnListing` in `src/access/index.ts` returns a Where clause, not a
boolean. Payload merges it into the query, so the rule holds over the REST API
and the admin UI equally. Never enforce ownership by hiding a button.

The `agent` field on properties is admin-only to update. Without that, an agent
could assign a listing to themselves and edit it — the ownership rule would be
decoration.

On create, `agent` defaults to the logged-in user via a `beforeChange` hook. An
admin can override it in the sidebar.

## Scope of ownership

Ownership applies to `properties` only.

Projects, companies, areas and articles are shared — any agent may edit, only an
admin may publish. Units belong to a project, so they follow the project, not an
agent.

If the client later wants projects owned by an agent, add an `agent` field to
projects and swap the access function. Do not do it pre-emptively.

## Agent profiles are public

Name, photo, phone and bio from the `users` collection render on the property
detail page and in enquiry emails. Email address stays private.

## Enquiry routing

An enquiry inherits `assignedAgent` from the property it was submitted against.
The notification email goes to that agent, with the admin address in bcc.

WhatsApp uses the agent's own number when set, falling back to a company-wide
number in env. Both paths must work — the client has not decided which they want.

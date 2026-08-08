import { t } from '@/messages/sq'

/**
 * A labelled form control with its error message.
 *
 * Shared by both public forms so a field looks and behaves the same wherever it
 * appears — the design inventory calls this "form field set" (docs/12).
 *
 * The accessibility wiring is the reason this is a component rather than markup
 * repeated per field: an error has to be tied to its input with
 * `aria-describedby` and announced, or a screen-reader user gets a form that
 * silently refuses to submit. `aria-invalid` marks the field itself, and the
 * message carries `role="alert"` so it is read when it appears.
 */
export function FormField({
  name,
  label,
  error,
  hint,
  optional,
  children,
}: {
  name: string
  label: string
  error?: string
  hint?: string
  optional?: boolean
  children: (props: {
    id: string
    name: string
    'aria-invalid': boolean | undefined
    'aria-describedby': string | undefined
  }) => React.ReactNode
}) {
  const id = `field-${name}`
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ')

  return (
    <div className={`form-field${error ? ' form-field--invalid' : ''}`}>
      <label className="form-field__label" htmlFor={id}>
        {label}
        {optional && <span className="form-field__optional"> ({t.form.optional})</span>}
      </label>

      {children({
        id,
        name,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy || undefined,
      })}

      {hint && (
        <p className="form-field__hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="form-field__error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

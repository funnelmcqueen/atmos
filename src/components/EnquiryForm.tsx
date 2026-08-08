'use client'

import { useActionState } from 'react'
import { submitEnquiry } from '@/app/actions/enquiry'
import { IDLE } from '@/app/actions/form-state'
import { HONEYPOT_FIELD, TOKEN_FIELD } from '@/lib/form-constants'
import { t } from '@/messages/sq'
import type { Locale } from '@/messages/sq'
import { FormField } from './FormField'

/**
 * The enquiry form on a property, unit or project page (docs/05).
 *
 * A client component because it needs `useActionState` — on success the form is
 * replaced by a confirmation **in place**, with no redirect. That is a product
 * decision, not a technical one: sending someone to a thank-you page loses the
 * listing they were looking at, and on mobile the way back is the browser's
 * back button, which re-submits often enough to be a real problem.
 *
 * `formToken` is minted on the server when the page renders and signed, so the
 * three-second timing check reads the server's clock rather than the client's
 * claim (see lib/terms.ts). It arrives as a prop because a client component
 * cannot sign anything.
 */
export function EnquiryForm({
  sourceType,
  sourceId,
  locale,
  formToken,
  heading,
}: {
  sourceType: 'property' | 'unit' | 'project'
  sourceId: string | number
  locale: Locale
  formToken: string
  heading?: string
}) {
  const [state, action, pending] = useActionState(submitEnquiry, IDLE)

  if (state.status === 'success') {
    return (
      <section className="enquiry enquiry--done" id="pyet">
        {/* Focusable and announced: after the form disappears, a keyboard or
            screen-reader user needs to land somewhere that says what happened. */}
        <div className="enquiry__success" role="status" tabIndex={-1}>
          <h2 className="section__heading">{t.enquiry.successTitle}</h2>
          <p>{t.enquiry.successBody}</p>
        </div>
      </section>
    )
  }

  const errors = state.errors ?? {}

  return (
    <section className="enquiry" id="pyet">
      <h2 className="section__heading">
        {heading ?? (sourceType === 'project' ? t.enquiry.headingProject : t.enquiry.heading)}
      </h2>
      <p className="enquiry__intro">{t.enquiry.intro}</p>

      <form className="form" action={action} noValidate>
        <input type="hidden" name="sourceType" value={sourceType} />
        <input type="hidden" name="sourceId" value={String(sourceId)} />
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name={TOKEN_FIELD} value={formToken} />

        {/* Honeypot. Hidden from people in every way that matters — off-screen,
            not tabbable, not announced, and explicitly not autofilled — so a
            browser or password manager never fills it by accident and a real
            visitor never trips it. */}
        <div className="form__honeypot" aria-hidden="true">
          <label htmlFor={`hp-${sourceId}`}>Company website</label>
          <input
            id={`hp-${sourceId}`}
            type="text"
            name={HONEYPOT_FIELD}
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </div>

        {state.message && (
          <p className="form__error" role="alert">
            {state.message}
          </p>
        )}

        <FormField name="name" label={t.form.name} error={errors.name}>
          {(props) => (
            <input className="form__control" type="text" autoComplete="name" required {...props} />
          )}
        </FormField>

        <FormField name="phone" label={t.form.phone} error={errors.phone}>
          {(props) => (
            <input
              className="form__control"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              {...props}
            />
          )}
        </FormField>

        <FormField name="email" label={t.form.email} error={errors.email} optional>
          {(props) => (
            <input className="form__control" type="email" autoComplete="email" {...props} />
          )}
        </FormField>

        <FormField name="message" label={t.form.message} error={errors.message} optional>
          {(props) => (
            <textarea
              className="form__control"
              rows={4}
              placeholder={t.enquiry.messagePlaceholder}
              {...props}
            />
          )}
        </FormField>

        {/* Never `defaultChecked` — consent has to be an action the person took
            (docs/05, §20). The server re-checks it regardless. */}
        <div className={`form-check${errors.terms ? ' form-check--invalid' : ''}`}>
          <input
            className="form-check__input"
            type="checkbox"
            id={`terms-${sourceId}`}
            name="terms"
            required
            aria-describedby={errors.terms ? `terms-${sourceId}-error` : undefined}
          />
          <label className="form-check__label" htmlFor={`terms-${sourceId}`}>
            {t.form.terms}
          </label>
        </div>
        {errors.terms && (
          <p className="form-field__error" id={`terms-${sourceId}-error`} role="alert">
            {errors.terms}
          </p>
        )}

        <button className="btn btn--primary form__submit" type="submit" disabled={pending}>
          {pending ? t.form.sending : t.enquiry.submit}
        </button>
      </form>
    </section>
  )
}

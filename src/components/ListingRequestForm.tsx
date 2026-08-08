'use client'

import { useActionState, useState } from 'react'
import { submitListingRequest } from '@/app/actions/listing-request'
import { IDLE } from '@/app/actions/form-state'
import {
  HONEYPOT_FIELD,
  TOKEN_FIELD,
  MAX_PHOTOS,
  MAX_TOTAL_BYTES,
} from '@/lib/form-constants'
import { t, PROPERTY_TYPE_LABELS, LISTING_TYPE_LABELS } from '@/messages/sq'
import type { Locale } from '@/messages/sq'
import { FormField } from './FormField'

/**
 * The owner submission form at /[locale]/dergo-pronen (docs/05).
 *
 * Confirmation renders in place on success, like the enquiry form.
 *
 * ## The photo size problem
 *
 * Server Actions have a request body limit (`serverActions.bodySizeLimit`, set
 * in next.config.ts). Fifteen photos straight off a phone can exceed it, and
 * when they do the framework rejects the request *before* the action runs — so
 * the server has no chance to return a friendly error and the visitor sees a
 * generic failure after waiting through the upload.
 *
 * So the total is measured here, on selection, and submission is blocked with a
 * message naming the actual problem. The action re-checks the same ceiling,
 * because a client-side check is a courtesy and never a control. The real fix
 * is uploading straight to Blob and posting only the ids — noted as a known
 * limit in docs/progress.md.
 */

const MB = 1024 * 1024

export function ListingRequestForm({
  locale,
  formToken,
}: {
  locale: Locale
  formToken: string
}) {
  const [state, action, pending] = useActionState(submitListingRequest, IDLE)
  const [photoCount, setPhotoCount] = useState(0)
  const [photoBytes, setPhotoBytes] = useState(0)

  const tooMany = photoCount > MAX_PHOTOS
  const tooLarge = photoBytes > MAX_TOTAL_BYTES
  const blocked = tooMany || tooLarge

  if (state.status === 'success') {
    return (
      <div className="form-success" role="status" tabIndex={-1}>
        <h2 className="section__heading">{t.listingRequest.successTitle}</h2>
        <p>{t.listingRequest.successBody}</p>
      </div>
    )
  }

  const errors = state.errors ?? {}

  const onPhotosChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    setPhotoCount(files.length)
    setPhotoBytes(files.reduce((sum, file) => sum + file.size, 0))
  }

  const photoError =
    errors.photos ??
    (tooMany ? t.listingRequest.photosTooMany : tooLarge ? t.listingRequest.photosTooLarge : undefined)

  return (
    <form className="form form--wide" action={action} noValidate>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name={TOKEN_FIELD} value={formToken} />

      <div className="form__honeypot" aria-hidden="true">
        <label htmlFor="hp-listing">Company website</label>
        <input
          id="hp-listing"
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

      <fieldset className="form__section">
        <legend className="form__legend">{t.listingRequest.sectionOwner}</legend>

        <FormField name="ownerName" label={t.form.fullName} error={errors.ownerName}>
          {(props) => (
            <input className="form__control" type="text" autoComplete="name" required {...props} />
          )}
        </FormField>

        <div className="form__row">
          <FormField name="ownerPhone" label={t.form.phone} error={errors.ownerPhone}>
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

          <FormField name="ownerEmail" label={t.form.email} error={errors.ownerEmail} optional>
            {(props) => (
              <input className="form__control" type="email" autoComplete="email" {...props} />
            )}
          </FormField>
        </div>
      </fieldset>

      <fieldset className="form__section">
        <legend className="form__legend">{t.listingRequest.sectionProperty}</legend>

        <div className="form__row">
          <FormField name="city" label={t.listingRequest.city} error={errors.city}>
            {(props) => (
              <input
                className="form__control"
                type="text"
                autoComplete="address-level2"
                required
                {...props}
              />
            )}
          </FormField>

          <FormField name="areaName" label={t.listingRequest.areaName} error={errors.areaName} optional>
            {(props) => <input className="form__control" type="text" {...props} />}
          </FormField>
        </div>

        <FormField name="address" label={t.listingRequest.address} error={errors.address} optional>
          {(props) => (
            <input className="form__control" type="text" autoComplete="street-address" {...props} />
          )}
        </FormField>

        <div className="form__row">
          <FormField name="listingType" label={t.listingRequest.listingType} error={errors.listingType}>
            {(props) => (
              <select className="form__control" required defaultValue="" {...props}>
                <option value="" disabled>
                  —
                </option>
                {Object.entries(LISTING_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            )}
          </FormField>

          <FormField
            name="propertyType"
            label={t.listingRequest.propertyType}
            error={errors.propertyType}
            optional
          >
            {(props) => (
              <select className="form__control" defaultValue="" {...props}>
                <option value="">—</option>
                {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            )}
          </FormField>
        </div>

        <div className="form__row form__row--three">
          <FormField name="rooms" label={t.listingRequest.rooms} error={errors.rooms} optional>
            {(props) => (
              <input className="form__control" type="text" placeholder="2+1" {...props} />
            )}
          </FormField>

          <FormField name="areaSqm" label={t.listingRequest.areaSqm} error={errors.areaSqm} optional>
            {(props) => (
              <input className="form__control" type="number" min={1} inputMode="numeric" {...props} />
            )}
          </FormField>

          <FormField name="floor" label={t.listingRequest.floor} error={errors.floor} optional>
            {(props) => <input className="form__control" type="number" inputMode="numeric" {...props} />}
          </FormField>
        </div>

        <FormField
          name="askingPrice"
          label={t.listingRequest.askingPrice}
          error={errors.askingPrice}
          optional
        >
          {(props) => (
            <input className="form__control" type="number" min={0} inputMode="numeric" {...props} />
          )}
        </FormField>

        <FormField
          name="description"
          label={t.listingRequest.description}
          error={errors.description}
          optional
        >
          {(props) => (
            <textarea
              className="form__control"
              rows={5}
              placeholder={t.listingRequest.descriptionPlaceholder}
              {...props}
            />
          )}
        </FormField>
      </fieldset>

      <fieldset className="form__section">
        <legend className="form__legend">{t.listingRequest.sectionPhotos}</legend>

        <FormField
          name="photos"
          label={t.listingRequest.photos}
          error={photoError}
          hint={t.listingRequest.photosHint}
          optional
        >
          {(props) => (
            <input
              className="form__control form__control--file"
              type="file"
              accept="image/*"
              multiple
              onChange={onPhotosChange}
              {...props}
            />
          )}
        </FormField>

        {photoCount > 0 && !photoError && (
          <p className="form__note">
            {photoCount} {t.listingRequest.photosSelected} ·{' '}
            {(photoBytes / MB).toFixed(1)} MB
          </p>
        )}
      </fieldset>

      <fieldset className="form__section">
        <legend className="form__legend">{t.listingRequest.sectionTerms}</legend>

        <div className="form-check">
          <input
            className="form-check__input"
            type="checkbox"
            id="field-hasDocumentation"
            name="hasDocumentation"
          />
          <label className="form-check__label" htmlFor="field-hasDocumentation">
            {t.listingRequest.hasDocumentation}
          </label>
        </div>

        {/* Never pre-ticked (docs/05, §20). The action re-checks it. */}
        <div className={`form-check${errors.terms ? ' form-check--invalid' : ''}`}>
          <input
            className="form-check__input"
            type="checkbox"
            id="field-terms"
            name="terms"
            required
            aria-describedby={errors.terms ? 'field-terms-error' : undefined}
          />
          <label className="form-check__label" htmlFor="field-terms">
            {t.form.terms}
          </label>
        </div>
        {errors.terms && (
          <p className="form-field__error" id="field-terms-error" role="alert">
            {errors.terms}
          </p>
        )}
      </fieldset>

      <button className="btn btn--primary form__submit" type="submit" disabled={pending || blocked}>
        {pending ? t.form.sending : t.listingRequest.submit}
      </button>
    </form>
  )
}

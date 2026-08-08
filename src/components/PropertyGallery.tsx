import Image from 'next/image'
import type { GalleryImage } from '@/lib/property-detail'

/**
 * Detail gallery. Renders real photos when present; falls back to a token-styled
 * placeholder otherwise (the seed ships no media yet). next/image carries real
 * width/height to avoid layout shift (docs/09).
 */
export function PropertyGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  if (images.length === 0) {
    return (
      <div className="gallery gallery--empty" role="img" aria-label={title}>
        <span className="gallery__placeholder">{title}</span>
      </div>
    )
  }

  const [cover, ...rest] = images

  return (
    <div className="gallery">
      <figure className="gallery__cover">
        <Image
          src={cover.url}
          alt={cover.alt}
          width={cover.width ?? 1200}
          height={cover.height ?? 800}
          sizes="(max-width: 900px) 100vw, 66vw"
          priority
        />
      </figure>
      {rest.length > 0 && (
        <div className="gallery__thumbs">
          {rest.map((img, i) => (
            <figure className="gallery__thumb" key={i}>
              <Image
                src={img.url}
                alt={img.alt}
                width={img.width ?? 600}
                height={img.height ?? 400}
                sizes="(max-width: 900px) 50vw, 22vw"
              />
            </figure>
          ))}
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { assetUrl } from '../../lib/utils.js'
import './SmartImage.css'

// An image that degrades gracefully: while a render has not been dropped into
// public/assets yet, a labelled placeholder tile is shown instead of a broken
// image icon. Once the file exists it renders normally (lazy-loaded).
export default function SmartImage({ src, alt, ratio = '4 / 3' }) {
  const [failed, setFailed] = useState(false)
  const url = assetUrl(src)

  if (failed) {
    return (
      <div className="smart-image smart-image--placeholder" style={{ aspectRatio: ratio }}>
        <span className="smart-image__icon" aria-hidden="true">
          ▢
        </span>
        <span className="smart-image__label">{alt}</span>
        <span className="smart-image__hint">IMAGE PENDING</span>
      </div>
    )
  }

  return (
    <img
      className="smart-image"
      src={url}
      alt={alt}
      loading="lazy"
      decoding="async"
      style={{ aspectRatio: ratio }}
      onError={() => setFailed(true)}
    />
  )
}
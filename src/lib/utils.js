// Small shared helpers used across pages and components.

// Conditional className joiner: cx('card', isActive && 'is-active')
export function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

// Zero-pads a number: pad(3) -> '03', pad(12, 3) -> '012'
export function pad(value, length = 2) {
  return String(value).padStart(length, '0')
}

// Encodes a path for use in href/src (handles spaces in file names).
export function assetUrl(path) {
  return encodeURI(path)
}

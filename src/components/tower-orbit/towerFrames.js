// Frame-sequence manifest for the tower orbit viewer. This is the single
// place to edit when the render set changes — e.g. the future 30-frame tower
// drop is a one-line swap of createFrameSequence() options below (prefix,
// range and pad may all differ; nothing else in the feature needs to change).
//
// The current set contains 121 frames: Avenue_67_000.jpg through Avenue_67_120.jpg.

// Builds an ordered list of existing frame URLs from a numbered convention.
// Numbers that fall inside `missing` are excluded; the remaining sequence is
// treated as one continuous 360° loop regardless of the gaps.
export function createFrameSequence({
  basePath,
  prefix = '',
  start = 1,
  end = 1,
  pad = 3,
  extension = '.webp',
  missing = [],
}) {
  const numbers = []
  for (let frame = start; frame <= end; frame += 1) {
    if (!missing.includes(frame)) numbers.push(frame)
  }
  const urls = numbers.map(
    (frame) => `${basePath}/${prefix}${String(frame).padStart(pad, '0')}${extension}`,
  )
  return { basePath, numbers, urls, count: urls.length }
}

// Current tower set: 121 frames, numbered 000 through 120.
// Future 30-frame tower example:
//   createFrameSequence({ basePath: '/assets/tower-v2', prefix: 'tower-',
//     start: 1, end: 30, pad: 4, extension: '.avif' })
export const TOWER_SEQUENCE = createFrameSequence({
  basePath: '/assets/tower',
  prefix: 'Avenue_67_',
  start: 0,
  end: 120,
  pad: 3,
  extension: '.jpg',
  missing: [],
})

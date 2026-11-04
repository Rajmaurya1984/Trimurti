import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import NavIcon from '../../site/NavIcon.jsx'
import { splitLandmarkTitle } from '../../landmarks/landmarkUtils.js'
import { LOCATION_CALLOUT_STYLE } from '../../../data/locationCallouts.js'

export function LocationCalloutProjection({ markers, elements }) {
  const projected = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ camera, size }) => {
    markers.forEach(marker => {
      const item = elements.current.get(marker.title)
      if (!item?.label || !item.path || !item.dot) return
      projected.set(...marker.position).applyMatrix4(camera.matrixWorldInverse)
      const behind = projected.z >= 0
      projected.set(...marker.position).project(camera)
      const front = !behind && Math.abs(projected.x) <= 1.15 && Math.abs(projected.y) <= 1.15
      item.label.style.visibility = front ? 'visible' : 'hidden'
      item.path.style.visibility = front ? 'visible' : 'hidden'
      item.dot.style.visibility = front ? 'visible' : 'hidden'
      if (!front) return
      const x = (projected.x + 1) * size.width / 2
      const y = (1 - projected.y) * size.height / 2
      // Keep the authored label offsets fixed relative to each panorama point.
      const { name } = splitLandmarkTitle(marker.title)
      const authored = LOCATION_CALLOUT_STYLE[name] ?? {}
      const compact = size.width > size.height && (size.width <= 1024
        || (size.height <= 600 && window.matchMedia('(pointer: coarse)').matches))
      const scale = compact ? .75 : size.width <= 700 ? .65 : 1
      const lift = 54 * scale + (marker.lift ?? authored.lift ?? 0) * scale
      const offset = (marker.labelOffset ?? authored.labelOffset ?? 0) * scale
      const halfWidth = item.label.offsetWidth / 2
      const center = x + offset
      const cardBottom = y - lift
      const cardTop = cardBottom - item.label.offsetHeight
      item.label.style.transform = `translate3d(${center}px, ${cardBottom}px, 0) translate(-50%, -100%)`
      // For cards hanging below their point, connect to the top edge. Keep
      // shifted leaders attached to the plate rather than ending in empty sky.
      const attachY = cardTop > y ? cardTop : cardBottom
      const attachX = THREE.MathUtils.clamp(x, center - halfWidth + 14, center + halfWidth - 14)
      item.path.setAttribute('d', `M ${x} ${y} L ${x} ${(y + attachY) / 2} L ${attachX} ${attachY}`)
      item.dot.setAttribute('cx', x)
      item.dot.setAttribute('cy', y)
    })
  })
  return null
}

export function LocationCallouts({ markers, categories, elements }) {
  const attach = (id, kind, node) => {
    const item = elements.current.get(id) ?? {}
    item[kind] = node
    elements.current.set(id, item)
  }
  return <div className="location-callouts" aria-label="Nearby places">
    <svg className="location-callouts__lines" aria-hidden="true">
      {markers.map(marker => <g key={marker.title}><path ref={node => attach(marker.title, 'path', node)} /><circle r="4" ref={node => attach(marker.title, 'dot', node)} /></g>)}
    </svg>
    {markers.map(marker => {
      const { name, meta } = splitLandmarkTitle(marker.title)
      const icon = Array.isArray(marker.category) ? 'pin'
        : categories.find(item => item.id === marker.category)?.icon ?? 'pin'
      return <div className="location-callouts__card" key={marker.title} ref={node => attach(marker.title, 'label', node)}>
        <NavIcon name={icon} /><span>{name}</span>{meta && <small>{meta}</small>}
      </div>
    })}
  </div>
}

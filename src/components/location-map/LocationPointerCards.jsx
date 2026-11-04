import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import NavIcon from '../site/NavIcon.jsx'
import { splitLandmarkTitle } from '../landmarks/landmarkUtils.js'
import { LOCATION_CATEGORIES } from '../../data/location.js'

export function LocationPointerProjection({ pointers, elements, selectedId }) {
  const projected = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ camera, size }) => {
    const occupied = []
    const origin = elements.current.root?.getBoundingClientRect()
    if (!origin) return
    document.querySelectorAll('.tm-location-tools, .tm-header, .bracket-micro-nav.is-open').forEach(node => {
      const r = node.getBoundingClientRect()
      occupied.push({ left:r.left-origin.left-8, right:r.right-origin.left+8, top:r.top-origin.top-8, bottom:r.bottom-origin.top+8 })
    })
    const ordered = [...pointers].sort((a,b) => Number(b.id === selectedId)-Number(a.id === selectedId))
    ordered.forEach(pin => {
      const item = elements.current.get(pin.id)
      if (!item?.card || !item.dot || !item.path) return
      projected.set(...pin.position).applyMatrix4(camera.matrixWorldInverse)
      const behind = projected.z >= 0
      projected.set(...pin.position).project(camera)
      const visible = !behind && Math.abs(projected.x)<1 && Math.abs(projected.y)<1
      item.card.style.visibility = 'hidden'
      item.path.style.visibility = 'hidden'
      item.dot.style.visibility = visible ? 'visible' : 'hidden'
      if (!visible) return
      const x = (projected.x+1)*size.width/2
      const y = (1-projected.y)*size.height/2
      item.dot.style.transform = 'translate(' + x + 'px,' + y + 'px) translate(-50%,-50%)'
      const width = item.card.offsetWidth, height = item.card.offsetHeight
      let rect = null
      for (const [dx,dy] of [[0,-58],[0,-116],[0,-174],[0,36],[-180,-70],[180,-70],[0,94]]) {
        const left = Math.max(12,Math.min(size.width-width-12,x-width/2+dx))
        const top = y+dy-height
        const candidate = { left, right:left+width, top, bottom:top+height }
        if (top<12 || candidate.bottom>size.height-12) continue
        if (occupied.some(r => candidate.left<r.right+8 && candidate.right>r.left-8 && candidate.top<r.bottom+8 && candidate.bottom>r.top-8)) continue
        rect=candidate; break
      }
      if (!rect) return
      occupied.push(rect)
      item.card.style.visibility='visible'
      item.card.style.transform='translate(' + rect.left + 'px,' + rect.top + 'px)'
      const attachX=Math.max(rect.left+14,Math.min(rect.right-14,x))
      const attachY=rect.top>y ? rect.top : rect.bottom
      item.path.style.visibility='visible'
      item.path.setAttribute('d','M '+x+' '+y+' L '+x+' '+((y+attachY)/2)+' L '+attachX+' '+attachY)
    })
  })
  return null
}

export function LocationPointerCards({ pointers, elements, selectedId, onSelect }) {
  function attach(id,kind,node) {
    const entry=elements.current.get(id) ?? {}
    entry[kind]=node
    if (!entry.card && !entry.dot && !entry.path) elements.current.delete(id)
    else elements.current.set(id,entry)
  }
  return <div className="tm-location-callouts" ref={node => { elements.current.root=node }} aria-label="Nearby places">
    <svg className="tm-location-leaders" aria-hidden="true">{pointers.map(pin => <path key={pin.id} ref={node=>attach(pin.id,'path',node)} />)}</svg>
    {pointers.map(pin => {
      const { name, meta }=splitLandmarkTitle(pin.title)
      const icon=LOCATION_CATEGORIES.find(item=>item.id===pin.category)?.icon ?? 'pin'
      return <div key={pin.id}>
        <button type="button" className="tm-location-dot" ref={node=>attach(pin.id,'dot',node)} aria-label={'Open '+name} aria-pressed={pin.id===selectedId} onClick={()=>onSelect(pin.id)} />
        <button type="button" className="tm-location-card" ref={node=>attach(pin.id,'card',node)} aria-pressed={pin.id===selectedId} onClick={()=>onSelect(pin.id)} title={pin.title}>
          <NavIcon name={icon}/><span>{name}</span>{meta && <small>{meta}</small>}
        </button>
      </div>
    })}
  </div>
}

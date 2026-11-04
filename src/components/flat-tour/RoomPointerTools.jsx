/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from 'react'
import { FLAT_THREE_ROOMS } from '../../data/flatThree.js'
import { PlacementPanel } from '../landmarks/PlacementPanel.jsx'

export function useRoomPointers(sourceScene, rooms = FLAT_THREE_ROOMS, storageKey = '67avenue-flat03-room-pointers-v1') {
  const [destination, setDestination] = useState('')
  const [copied, setCopied] = useState(false)
  const [json, setJson] = useState('')
  const [message, setMessage] = useState('')
  const [markers, setMarkers] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]')
      return Array.isArray(saved) ? saved.filter(m => typeof m.id === 'string'
        && rooms.some(r => r.id === m.sourceScene) && rooms.some(r => r.id === m.category)
        && Array.isArray(m.position) && m.position.length === 3 && m.position.every(Number.isFinite)) : []
    } catch { 
      return [] 
    }
  })
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(markers)) } 
    catch { /* JSON export remains available. */ }
  }, [markers, storageKey])
  const categories = rooms.filter(r => r.id !== sourceScene).map(r => ({ id: r.id, label: r.name }))
  const target = categories.some(c => c.id === destination) ? destination : categories[0].id
  const current = markers.filter(m => m.sourceScene === sourceScene)

  const place = position => {
    setCopied(false)
    setMarkers(list => [...list.filter(marker => marker.sourceScene !== sourceScene || marker.category !== target), { id: crypto.randomUUID(), sourceScene,
      category: target, title: rooms.find(r => r.id === target).name, description: '', position }])
  }
  const undo = () => { 
    const last = current.at(-1)?.id; 
    setMarkers(list => list.filter(m => m.id !== last)); 
    setCopied(false) 
  }
  const clear = () => { 
    setMarkers(list => list.filter(m => m.sourceScene !== sourceScene)); 
    setCopied(false) 
  }
  const copy = async () => {
    const text = JSON.stringify(markers.map(({ sourceScene, title, category, description, position }) => ({ sourceScene, title, category, description, position })), null, 2)
    setJson(text)
    try { 
      await navigator.clipboard.writeText(text); 
      setCopied(true); 
      setMessage('Copied all room pointers. Paste the JSON into the chat.') 
    }
    catch { 
      setMessage('Select and copy the JSON below.') 
    }
  }

  return { categories, target, setDestination, current, markers, place, undo, clear, copy, copied, json, message }
}

export function RoomPointerPanel({ tools, name }) {
  return <aside className="flat-pointer-tools" aria-label="Room pointer placement">
    <PlacementPanel title="Room marker placement" categories={tools.categories} placementCategory={tools.target} onPlacementCategory={tools.setDestination}
      instructions={`In ${name}: choose the destination room, then double-click its doorway or location. Undo/Clear affect this room; Copy exports every room. Markers save in this browser. Use Done placing markers to test them.`}
      onUndo={tools.undo} onClear={tools.clear} onCopy={tools.copy} canEdit={tools.current.length > 0} didCopy={tools.copied} />
    <p>{tools.current.length} pointers here · {tools.markers.length} total</p>
    {!tools.current.length && tools.markers.length > 0 && <button type="button" onClick={tools.copy}>Copy all rooms</button>}
    {tools.message && <p role="status">{tools.message}</p>}
    {tools.json && <textarea aria-label="Room pointer JSON" value={tools.json} readOnly onFocus={e => e.target.select()} />}
  </aside>
}
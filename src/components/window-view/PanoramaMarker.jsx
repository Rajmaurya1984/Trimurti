import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

// A panorama pointer belongs to a world position, and is visible only while
// that exact position is inside the camera's view. Never pin it to an edge.
export default function PanoramaMarker({ position, children, ...props }) {
  const anchor = useRef(null)
  const element = useRef(null)
  const projected = useRef(new THREE.Vector3())
  useFrame(({ camera }) => {
    if (!anchor.current || !element.current) return
    camera.updateMatrixWorld()
    anchor.current.updateWorldMatrix(true, false)
    anchor.current.getWorldPosition(projected.current)
    projected.current.project(camera)
    const { x, y, z } = projected.current
    const visible = z >= -1 && z <= 1 && Math.abs(x) <= 1 && Math.abs(y) <= 1
    element.current.style.visibility = visible ? 'visible' : 'hidden'
    element.current.style.pointerEvents = visible ? 'auto' : 'none'
  })
  return <group ref={anchor} position={position}>
    <Html ref={element} center {...props} style={{ visibility: 'hidden' }}>{children}</Html>
  </group>
}

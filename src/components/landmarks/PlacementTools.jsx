import { Html } from '@react-three/drei'
/* eslint-disable react-refresh/only-export-components */
export { usePlacementMarkers, PlacementPanel } from './PlacementPanel.jsx'

export function PlacementMarker({ marker }) {
  return (
    <group position={marker.position}>
      <mesh>
        <sphereGeometry args={[0.65, 16, 16]} />
        <meshBasicMaterial color="#ff526f" depthTest={false} />
      </mesh>
      <Html center zIndexRange={[100001, 0]} style={{ pointerEvents: 'none' }}>
        <div className="placement-pin">{marker.title}</div>
      </Html>
    </group>
  )
}



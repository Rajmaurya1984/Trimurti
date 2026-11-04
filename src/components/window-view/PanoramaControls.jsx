/* eslint-disable react-hooks/immutability -- Three.js camera and shared animation ref are imperative GSAP targets. */
import { useEffect, useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'

const UP = new THREE.Vector3(0, 1, 0)

export default function PanoramaControls({ fov, setFov, rotating, rotationDelay = 0, arrivalView, travel, onTravelFov, horizontalSpan, minFov = 35, maxFov = 95, suspended = false }) {
  const { gl, get, size } = useThree()
  const horizontalFov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(fov) / 2) * size.width / Math.max(1, size.height))
  const azimuthLimit = horizontalSpan ? Math.max(0, (horizontalSpan - horizontalFov) / 2 - 0.01) : Infinity
  const controlsRef = useRef(null)
  const arrivalRef = useRef(null)
  const travelRef = useRef(null)
  const interactingRef = useRef(false)
  const rotationIdleRef = useRef(0)
  const rotationDirectionRef = useRef(-1)

  useLayoutEffect(() => {
    const camera = get().camera
    const controls = controlsRef.current
    if (!controls || !arrivalView || suspended) return undefined
    // Flush drag momentum before steering into the destination's authored view.
    controls.enableDamping = false
    controls.update()
    controls.enabled = false
    interactingRef.current = false
    const angle = arrivalView.arrivalU * Math.PI * 2
    if (arrivalView.arrivalImmediate) {
      const pitch = THREE.MathUtils.degToRad(arrivalView.arrivalPitch ?? 0)
      const radius = camera.position.length()
      controls.target.set(0, 0, 0)
      camera.position.set(
        -Math.cos(angle) * Math.cos(pitch),
        -Math.sin(pitch),
        -Math.sin(angle) * Math.cos(pitch),
      ).multiplyScalar(radius)
      const arrivalFov = THREE.MathUtils.clamp(arrivalView.arrivalFov ?? 72, minFov, maxFov)
      camera.fov = arrivalFov
      setFov(arrivalFov)
      camera.updateProjectionMatrix()
      controls.update()
      controls.enabled = true
      controls.enableDamping = true
      return undefined
    }
    if (travel) {
      const motion = travel.motion.current
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const radius = camera.position.length()
      const arrive = () => {
        camera.position.set(-Math.cos(angle), 0, -Math.sin(angle)).multiplyScalar(radius)
        // Reset the lens while hidden for transitions that only zoom in.
        if (reduce || travel.zoomInOnly) { camera.fov = 72; camera.updateProjectionMatrix() }
        controls.update()
        motion.reveal = 1
        onTravelFov?.(72)
      }
      const timeline = gsap.timeline({ onComplete: () => {
        motion.finished = true
        travelRef.current = null
        controls.enabled = true
        controls.enableDamping = true
      } })
      travelRef.current = timeline
      if (reduce) {
        arrive()
        motion.shade = 1
        timeline.to({}, { duration: .01 })
      } else {
        // Keep the current heading: lateral steering feels like a sideways slide.
        timeline.to(camera, { fov: Math.min(camera.fov, 35), duration: .75,
          ease: 'power2.inOut', onUpdate: () => camera.updateProjectionMatrix() }, 0)
        timeline.to(motion, { shade: 0, duration: .4, ease: 'sine.inOut' }, .35)
        timeline.call(arrive)
        timeline.addLabel('reveal')
        timeline.to(motion, { shade: 1, duration: .65, ease: 'sine.inOut' }, 'reveal')
        if (!travel.zoomInOnly) {
          timeline.to(camera, { fov: 72, duration: .85, ease: 'sine.inOut',
            onUpdate: () => camera.updateProjectionMatrix() }, 'reveal')
        }
      }
      return () => {
        timeline.kill()
        travelRef.current = null
        controls.enabled = true
        controls.enableDamping = true
      }
    }
    const start = camera.position.clone().normalize()
    const target = new THREE.Vector3(-Math.cos(angle), 0, -Math.sin(angle))
    arrivalRef.current = {
      start,
      turn: new THREE.Quaternion().setFromUnitVectors(start, target),
      rotation: new THREE.Quaternion(),
      radius: camera.position.length(),
      elapsed: 0,
      reduce: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      travel,
      doorway: travel?.position ? new THREE.Vector3(...travel.position).setY(0).normalize().negate() : start.clone(),
    }
    return () => {
      arrivalRef.current = null
      controls.enabled = true
      controls.enableDamping = true
    }
  }, [arrivalView, get, travel, onTravelFov, minFov, maxFov, setFov, suspended])
  useEffect(() => {
    const canvas = gl.domElement
    const pointers = new Map()
    const wheel = (event) => {
      event.preventDefault()
      if (suspended || arrivalRef.current || travelRef.current) return
      const pixels = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? canvas.clientHeight : 1)
      setFov((value) => THREE.MathUtils.clamp(Math.min(value, maxFov) + THREE.MathUtils.clamp(pixels * 0.04, -10, 10), minFov, maxFov))
    }
    
    const distance = () => {
      const [a, b] = [...pointers.values()]
      return Math.hypot(a.x - b.x, a.y - b.y)
    }

    const down = (event) => {
      if (event.pointerType === 'touch') pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    }

    const move = (event) => {
      if (suspended || arrivalRef.current || travelRef.current) return
      if (!pointers.has(event.pointerId)) return
      const before = pointers.size === 2 ? distance() : 0
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
      if (pointers.size !== 2 || before === 0) return
      const after = distance()
      if (after > 0) setFov((value) => THREE.MathUtils.clamp(Math.min(value, maxFov) * before / after, minFov, maxFov))
    }
  
    const up = (event) => pointers.delete(event.pointerId)
    canvas.addEventListener('wheel', wheel, { passive: false })
    canvas.addEventListener('pointerdown', down)
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerup', up)
    canvas.addEventListener('pointercancel', up)
    canvas.addEventListener('lostpointercapture', up)
    return () => {
      canvas.removeEventListener('wheel', wheel)
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointercancel', up)
      canvas.removeEventListener('lostpointercapture', up)
    }
  }, [gl, setFov, minFov, maxFov, suspended])
  

  useFrame(({ camera }, delta) => {
    if (suspended) { rotationIdleRef.current = 0; return }
    if (travelRef.current) { rotationIdleRef.current = 0; return }
    const arrival = arrivalRef.current
    if (arrival) {
      const duration = arrival.travel ? .95 : .85
      arrival.elapsed = Math.min(1, arrival.elapsed + (arrival.reduce ? 1 : Math.min(delta, .05) / duration))
      const t = arrival.elapsed
      const eased = t ** 3 * (t * (t * 6 - 15) + 10)
      if (arrival.travel) {
        const seconds = t * duration
        const approach = THREE.MathUtils.smoothstep(seconds, 0, .18)
        const doorTurn = new THREE.Quaternion().setFromUnitVectors(arrival.start, arrival.doorway)
        arrival.rotation.identity().slerp(doorTurn, approach)
        camera.position.copy(arrival.start).applyQuaternion(arrival.rotation).multiplyScalar(arrival.radius)
        // The destination sphere is aligned with the doorway while moving.
        // Restore its native camera heading only when that sphere is replaced.
        if (t === 1) camera.position.copy(arrival.start).applyQuaternion(arrival.turn).multiplyScalar(arrival.radius)
      } else {
        arrival.rotation.identity().slerp(arrival.turn, eased)
        camera.position.copy(arrival.start).applyQuaternion(arrival.rotation).multiplyScalar(arrival.radius)
      }
      controlsRef.current.update()
      if (t === 1) {
        arrivalRef.current = null
        controlsRef.current.enabled = true
        controlsRef.current.enableDamping = true
      }
    }
    // Rotate by elapsed time without adding OrbitControls damping momentum,
    // so pausing stops immediately and manual dragging always takes priority.
    if (!rotating || arrival || interactingRef.current) rotationIdleRef.current = 0
    else {
      rotationIdleRef.current += Math.min(delta, 0.05)
      if (rotationIdleRef.current >= rotationDelay) {
        if (horizontalSpan && controlsRef.current) {
          const angle = controlsRef.current.getAzimuthalAngle()
          if (angle <= -azimuthLimit + 0.01) rotationDirectionRef.current = 1
          else if (angle >= azimuthLimit - 0.01) rotationDirectionRef.current = -1
        }
        camera.position.applyAxisAngle(UP, rotationDirectionRef.current * 0.03 * Math.min(delta, 0.05))
      }
    }
    if (!arrival?.travel && Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = Math.min(maxFov, THREE.MathUtils.damp(camera.fov, fov, 12, delta))
      camera.updateProjectionMatrix()
    }
    
  }, -2)
  // Zoom changes field of view; dollying would move the camera inside the sphere.
  return <OrbitControls ref={controlsRef} makeDefault enabled={!suspended} enablePan={false} enableZoom={false}
    minAzimuthAngle={-azimuthLimit} maxAzimuthAngle={azimuthLimit}
    minPolarAngle={horizontalSpan ? Math.PI / 2 : 0} maxPolarAngle={horizontalSpan ? Math.PI / 2 : Math.PI}
    enableDamping dampingFactor={0.08} rotateSpeed={-0.35}
    onStart={() => { interactingRef.current = true; rotationIdleRef.current = 0 }}
    onEnd={() => { interactingRef.current = false }} />
}

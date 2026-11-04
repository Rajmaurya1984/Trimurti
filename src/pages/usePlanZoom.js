// Fixed plan: the drawing always renders at 97% of the stage, centred.
// No pan, zoom, wheel or pinch. Kept as a hook stub for compatibility.
export default function usePlanZoom() {
  return {
    stageRef: { current: null },
    frameRef: { current: null },
    view: { scale: 0.97, x: 0, y: 0 },
    dragging: false,
    zoom: () => {},
    fit: () => {},
    minZoom: 0.97,
    maxZoom: 0.97,
    handlers: {},
  }
}

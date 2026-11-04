// Same perimeter order as 67Avenue: front-right, front-left, back-left, back-right.
// Front is positive Z and right is positive X in the panorama coordinates.
export const GROUND_FLOOR_CORNERS = [
  [10.045, -46.808, 10.446],
  [-13.356, -45.997, 10.339],
  [-13.02, -46.262, -9.557],
  [10.453, -46.906, -9.568],
]

export function isGroundFloorCorner(pin) {
  return GROUND_FLOOR_CORNERS.some(point => Math.hypot(...point.map((value, axis) => value - pin.position[axis])) < 0.1)
}
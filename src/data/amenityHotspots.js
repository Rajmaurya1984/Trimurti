// Confirmed positions from the latest panorama pointer export.
// Legacy walking destinations resolve to the two current camera renders.
const DESTINATION_ALIASES = { 'walking-1': 'walking-3', 'walking-4': 'walking-2' }

export const AMENITY_HOTSPOTS = [
  ['yoga', 'ludo', 'Life-size Ludo', [2.632, -19.025, 46.105]],
  ['yoga', 'walking-1', 'Walking Space 1', [48.174, -12.275, -5.023]],
  ['walking-3', 'yoga', 'Yoga Deck', [-49.297, -8.123, 0.553]],
  ['walking-3', 'walking-4', 'Walking Space Area', [49.526, -5.482, -2.749]],
  ['walking-2', 'stargazing', 'Stargazing Deck', [49.578, -5.331, 2.064]],
  ['walking-2', 'walking-1', 'Walking Space Area', [-49.34, -6.402, 4.33]],
  ['stargazing', 'walking-4', 'Walking Space Area', [48.71, -9.847, 5.045]],
  ['stargazing', 'swings', 'Swing Area', [12.762, -16.206, -45.479]],
  ['swings', 'stargazing', 'Stargazing Deck', [-22.838, -11.642, 42.922]],
  ['swings', 'walking-4', 'Walking Space Area', [22.866, -12.063, 42.781]],
  ['swings', 'screening', 'Outdoor Screening Space', [1.742, -9.906, -48.884]],
  ['screening', 'swings', 'Swing Area', [-9.356, -10.155, -48.008]],
  ['screening', 'terrace-1', 'Terrace Seating 1', [-27.954, -10.963, 39.901]],
  ['kids', 'terrace-1', 'Terrace Seating 1', [49.535, -6.297, -0.602]],
  ['kids', 'gazebo', 'Gazebo Seating', [-49.716, -1.063, -4.906]],
  ['gazebo', 'kids', "Kids' Play Area", [49.868, -3.343, -0.023]],
  ['gazebo', 'ludo', 'Life-size Ludo', [3.4, -7.958, -49.19]],
  ['ludo', 'yoga', 'Yoga Deck', [32.576, -14.46, -34.953]],
  ['ludo', 'gazebo', 'Gazebo Seating', [-47.65, -3.019, 14.713]],
  ['terrace-1', 'screening', 'Outdoor Screening Space', [-21.513, -15.988, 42.146]],
  ['terrace-1', 'kids', "Kids' Play Area", [47.898,-13.363,-4.796]],
  ['terrace-1', 'terrace-2', 'Terrace Seating 2', [-47.683, -11.462, -9.663]],
  ['terrace-2', 'screening', 'Outdoor Screening Space', [25.375, -10.573, 41.66]],
  ['terrace-2', 'kids', "Kids' Play Area", [49.404, -7.411, -0.598]],
].map(([sourceScene, destination, title, position]) => {
  const category = DESTINATION_ALIASES[destination] ?? destination
  return {
    id: `${sourceScene}-${category}`, sourceScene, category, title, description: '', position,
  }
})

// Each render has its own orientation. In the destination, the return pointer
// locates where we came from; face away from it to continue moving forward.
export function getAmenityTravelArrival(sourceScene, destinationScene, outgoingPointer, heading) {
  const returnPointer = AMENITY_HOTSPOTS.find((marker) =>
    marker.sourceScene === destinationScene.id && marker.category === sourceScene)
  // Preserve the user's look direction relative to the clicked path. Straight
  // ahead stays straight ahead; clicking to the side doesn't force a full turn.
  const outgoingAngle = outgoingPointer
    ? Math.atan2(outgoingPointer.position[2], outgoingPointer.position[0]) : 0
  const offset = Number.isFinite(heading) && outgoingPointer ? heading - outgoingAngle : 0
  let destinationAngle
  if (returnPointer) {
    const [x, , z] = returnPointer.position
    destinationAngle = Math.atan2(-z, -x) + offset
  } else if (Number.isFinite(heading) || outgoingPointer) {
    // Calibrate through other paired paths when this route has no return dot.
    const rotations = new Map([[sourceScene, 0]])
    for (const [currentScene, rotation] of rotations) {
      for (const edge of AMENITY_HOTSPOTS.filter((marker) => marker.sourceScene === currentScene)) {
        if (rotations.has(edge.category)) continue
        const reverse = AMENITY_HOTSPOTS.find((marker) =>
          marker.sourceScene === edge.category && marker.category === currentScene)
        if (!reverse) continue
        const from = Math.atan2(edge.position[2], edge.position[0])
        const to = Math.atan2(-reverse.position[2], -reverse.position[0])
        rotations.set(edge.category, rotation + to - from)
      }
    }
    const rotation = rotations.get(destinationScene.id)
    if (rotation !== undefined) destinationAngle = (Number.isFinite(heading) ? heading : outgoingAngle) + rotation
  }
  // Uncalibrated renders still open on their measured amenity feature.
  if (destinationAngle === undefined) return destinationScene
  const turns = destinationAngle / (2 * Math.PI)
  const arrivalU = ((turns % 1) + 1) % 1
  return { ...destinationScene, arrivalU }
}

// Confirmed Flat 03 doorway positions supplied by the project owner.
export const FLAT_THREE_HOTSPOTS = [
  ['living', 'passage', 'Living Passage', [-21.302, -19.46, 40.798]],
  ['living', 'balcony', 'Balcony View', [-49.054, -2.838, 8.895]],
  // Return links placed at the living-room openings in the source panoramas.
  ['balcony', 'living', 'Living Room', [-16.4, -10.7, -41.421]],
  ['passage', 'living', 'Living Room', [32.76, -14.088, 18.558]],
  ['passage', 'bedroom-1', 'Bedroom 1', [-49.937, -0.793, 0.645]],
  ['passage', 'bedroom-2', 'Bedroom 2', [-46.756, -1.25, -17.417]],
  ['passage', 'kitchen', 'Kitchen', [-39.837, -21.153, 21.473]],
  ['bedroom-1', 'bathroom-1', 'Bathroom 1', [-35.406, 2.975, 35.126]],
  ['bedroom-1', 'passage', 'Living Passage', [48.917, -2.647, 9.816]],
  ['bedroom-2', 'bathroom-2', 'Bathroom 2', [-15.243, 5.046, -47.282]],
  ['bedroom-2', 'passage', 'Living Passage', [49.606, 1.977, -5.405]],
  ['bathroom-2', 'bedroom-2', 'Bedroom 2', [48.954, 9.323, -2.693]],
  ['bathroom-1', 'bedroom-1', 'Bedroom 1', [45.949, 19.513, -1.438]],
  ['kitchen', 'living', 'Living Room', [8.785, -6.637, 48.703]],
  ['kitchen', 'bedroom-2', 'Bedroom 2', [41.546, 2.686, 27.62]],
  ['kitchen', 'bedroom-1', 'Bedroom 1', [12.142, -0.04, -48.44]],
].map(([sourceScene, category, title, position]) => ({
  id: `${sourceScene}-${category}`, sourceScene, category, title, description: '', position,
}))

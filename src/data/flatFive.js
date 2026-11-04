// Flat No. 05, Wing B: visually estimated camera positions and panorama axes.
const ROOT = '/assets/plan/3bhk/Flat_No_05_( Wing B )_'
export const FLAT_FIVE_MAP_VIEWBOX = '288 140 235 128'
export const FLAT_FIVE_MAP_ASPECT = 235 / 128
// Mini-map room assignments corrected using the owner's six-label mapping.
// Positions estimate the panorama capture point on walkable floor, not the bed/room centre.
// Percentages are relative to the crop above; exact 3D camera coordinates are unavailable.
const definitions = [
  ["living","Living Room","Living_room",8.7,85.6,0.53,0],
  ["balcony","Balcony View","Living Room_Balcony",20,22,0.68,0],
  ["passage","Living Passage","Living_Passage",24.4,66.5,0.5,90],
  ["kitchen","Kitchen","Kitchen",43.6,70.3,0.5,180],
  ["bedroom-1","Master Bedroom 1","M_Bedroom_01",84,53,0.52,0],
  ["bathroom-1","Bathroom 1","M_Toilet_01",87,76,0.5,180],
  ["bedroom-2","Master Bedroom 2","M_Bedroom_02",28,47,0.54,0],
  ["bathroom-2","Bathroom 2","M_Toilet_02",49,40,0.5,180],
  ["bedroom-3","Bedroom 3","Bedroom",59,40,0.41,0],
  ["toilet","Common Toilet","Common_Toilet",60,76,0.5,0],
]
export const FLAT_FIVE_ROOMS = definitions.map(([id, name, file, left, top, u]) => ({
  id, name, image: ROOT + file + '.jpg', left, top,
  cameraPosition: { left, top }, arrivalU: u, arrivalImmediate: true, arrivalFov: 95,
}))
const anchors = Object.fromEntries(definitions.map(([id, , , , , u, heading]) => [id, { u, heading }]))
export function flatFiveRadarHeading(direction, roomId) {
  const anchor = anchors[roomId]
  const azimuth = Math.atan2(direction.z, direction.x) * 180 / Math.PI
  // Camera yaw and CSS clockwise rotation increase together for this flat.
  // Apply the offset from the reference axis without reversing its sign.
  return ((anchor.heading + (azimuth - anchor.u * 360)) % 360 + 360) % 360
}
// Initial doorway locations read visually from the panoramas; refine in the marker editor.
const links = [
  ['living', 'balcony', .53], ['living', 'passage', .69],
  ['balcony', 'living', .3],
  ['passage', 'living', .08], ['passage', 'bedroom-3', .405],
  ['passage', 'kitchen', .54], ['passage', 'toilet', .5],
  ['kitchen', 'passage', .75], ['kitchen', 'bedroom-1', .28], ['kitchen', 'bedroom-2', .215],
  ['bedroom-3', 'passage', .95],
   ['bedroom-1', 'bathroom-1', .24],
  ['bedroom-2', 'bathroom-2', .72],
  ['bathroom-1', 'bedroom-1', 0], ['bathroom-2', 'bedroom-2', 0],
  ['toilet', 'passage', .96],
]
const estimatedHotspots = links.map(([sourceScene, category, u]) => {
  const yaw = u * Math.PI * 2
  const pitch = -.12
  return {
    id: sourceScene + '-' + category, sourceScene, category,
    title: FLAT_FIVE_ROOMS.find(room => room.id === category).name, description: '',
    position: [50 * Math.cos(pitch) * Math.cos(yaw), 50 * Math.sin(pitch), 50 * Math.cos(pitch) * Math.sin(yaw)],
  }
})

// Confirmed Flat 05 doorway positions supplied by the project owner.
const confirmedHotspots = [
  [
    "bathroom-1",
    "bedroom-1",
    "Master Bedroom 1",
    [
      44.806,
      21.083,
      -6.27
    ]
  ],
  [
    "passage",
    "toilet",
    "Common Toilet",
    [
      -49.476,
      -5.342,
      -4.115
    ]
  ],
  [
    "passage",
    "bedroom-2",
    "Master Bedroom 2",
    [
      -42.414,
      -3.087,
      26.141
    ]
  ],
  [
    "bedroom-2",
    "passage",
    "Living Passage",
    [
      48.491,
      -7.756,
      9.313
    ]
  ],
  [
    "bedroom-2",
    "bathroom-2",
    "Bathroom 2",
    [
      -8.122,
      -6.07,
      -48.869
    ]
  ],
  [
    "bathroom-2",
    "bedroom-2",
    "Master Bedroom 2",
    [
      47.396,
      15.391,
      -3.54
    ]
  ],
  [
    "passage",
    "bedroom-1",
    "Master Bedroom 1",
    [
      -49.913,
      2.07,
      0.119
    ]
  ],
  [
    "bedroom-1",
    "bathroom-1",
    "Bathroom 1",
    [
      41.807,
      0.737,
      -27.333
    ]
  ],
  [
    "bedroom-1",
    "passage",
    "Living Passage",
    [
      3.252,
      -2.978,
      49.723
    ]
  ],
  [
    "passage",
    "bedroom-3",
    "Bedroom 3",
    [
      -49.639,
      -3.591,
      4.483
    ]
  ],
  [
    "bedroom-3",
    "passage",
    "Living Passage",
    [
      47.243,
      -1.538,
      -16.023
    ]
  ],
  [
    "passage",
    "balcony",
    "Balcony View",
    [
      22.117,
      -5.878,
      44.357
    ]
  ],
  [
    "passage",
    "living",
    "Living Room",
    [
      36.602,
      -19.675,
      -27.683
    ]
  ]
].map(([sourceScene, category, title, position]) => ({
  id: sourceScene + '-' + category, sourceScene, category, title, description: '', position,
}))

export const FLAT_FIVE_HOTSPOTS = [
  ...estimatedHotspots.filter(marker => !confirmedHotspots.some(confirmed => confirmed.id === marker.id)),
  ...confirmedHotspots,
]

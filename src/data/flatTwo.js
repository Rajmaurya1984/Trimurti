// Flat No. 02, Wing B. Coordinates refer to the 215 x 125 floor-plan crop.
// Viewing positions are visually matched to the entry-side panorama capture spots.
// Percentages are relative to the crop below; they are not surveyed camera coordinates.
// The room ping and radar origin both use these same positions.
const ROOT = '/assets/plan/2bhk/Flat_No_02_( Wing B )_'
export const FLAT_TWO_MAP_VIEWBOX = '75 455 215 125'
export const FLAT_TWO_MAP_ASPECT = 215 / 125
const definitions = [
  ["living","Living Room","Living Room",90.8,15.9,0.47],
  ["balcony","Balcony View","Living Room_Balcony",95.3,70.3,0.68],
  ["passage","Living Passage","Living Passage",63.4,40,0.5],
  ["kitchen","Kitchen","Kitchen",50.1,30.9,0.5],
  ["bedroom-1","Bedroom 1","M_Bedroom_01",32,48,0.7],
  ["bedroom-2","Bedroom 2","M_Bedroom_02",61,61,0.44],
  ["bathroom-1","Bathroom 1","M_Toilet_01",11.5,49,0.5],
  ["bathroom-2","Bathroom 2","M_Toilet_02",68,85,0.5],
  ["toilet","Common Toilet","Toilet",70.3,52.2,0.5],
]
export const FLAT_TWO_ROOMS = definitions.map(([id, name, file, left, top, u]) => ({
  id, name, image: ROOT + file + '.jpg', left, top,
  cameraPosition: { left, top }, arrivalU: u, arrivalImmediate: true, arrivalFov: 95,
}))
// Exact doorway positions supplied by the project owner.
const pointers = [
  ["toilet","passage","Living Passage", [49.031,6.658,6.559]],
  ['bathroom-1', 'bedroom-1', 'Bedroom 1', [47.616, 13.296, -6.827]],
  ['bathroom-2', 'bedroom-2', 'Bedroom 2', [48.163, 12.664, -3.579]],
  ['kitchen' ,'bedroom-1','Bedroom 1', [6.649,-2.229,49.412]],
  ['kitchen','bedroom-2','Bedroom 2',[19.648,-8.231,-45.181]],
  ['kitchen', 'toilet', 'Common Toilet' ,[12.079,-2.738,-48.346]],
  ['passage','toilet','Common Toilet',[ -34.758,11.47,-34.019]],
  [
    "living",
    "balcony",
    "Balcony View",
    [
      -120.454,
      -13.191,
      15.837
    ]
  ],
  [
    "living",
    "passage",
    "Living Passage",
    [
      -20.991,
      -17.927,
      41.603
    ]
  ],
  [
    "balcony",
    "living",
    "Living Room",
    [
      -8.5,
      -10.821,
      48.001
    ]
  ],
  [
    "passage",
    "bedroom-1",
    "Bedroom 1",
    [
      -49.968,
      -0.126,
      -0.559
    ]
  ],
  [
    "passage",
    "bedroom-2",
    "Bedroom 2",
    [
      -47.438,
      1.067,
      -15.532
    ]
  ],
  [
    "passage",
    "kitchen",
    "Kitchen",
    [
      -46.327,
      -14.511,
      11.612
    ]
  ],
  [
    "passage",
    "living",
    "Living Room",
    [
      40,
      -13.402,
      26.766
    ]
  ],
  [
    "kitchen",
    "passage",
    "Living Passage",
    [
      2.582,
      -21.183,
      -45.123
    ]
  ],
  [
    "bedroom-1",
    "passage",
    "Living Passage",
    [
      48.551,
      -6.181,
      9.97
    ]
  ],
  [
    "bedroom-1",
    "bathroom-1",
    "Bathroom 1",
    [
      -48.421,
      -5.047,
      -11.042
    ]
  ],
  [
    "bedroom-2",
    "passage",
    "Living Passage",
    [
      49.727,
      -0.276,
      -5.042
    ]
  ],
  [
    "bedroom-2",
    "bathroom-2",
    "Bathroom 2",
    [
      -49.001,
      -2.845,
      -9.253
    ]
  ]
]
export const FLAT_TWO_HOTSPOTS = pointers.map(([sourceScene, category, title, position]) => ({
  id: sourceScene + '-' + category, sourceScene, category, title, description: '', position,
}))

// Panorama orientation is independent of map-pin positions and navigation links.
// u is the horizontal texture coordinate of a visible wall axis; heading is
// clockwise from the TOP OF THE DRAWING (not geographic north).
// Calibrated visually against the floor plan and the supplied panoramas.
export const FLAT_TWO_RADAR_ANCHORS = {
  living: { u: .467, heading: 180 }, // Balcony wall, below the living room.
  balcony: { u: .278, heading: 0 }, // Sliding doors back into the living room.
  passage: { u: .5, heading: 270 }, // Kitchen opening, toward the left wing.
  kitchen: { u: .5, heading: 0 }, // Hob/counter wall along the top of the kitchen.
  'bedroom-1': { u: .7, heading: 180 }, // Window on the bottom exterior wall.
  'bedroom-2': { u: .44, heading: 180 }, // Window on the bottom exterior wall.
  'bathroom-1': { u: .977, heading: 90 }, // Door back into Bedroom 1, to the right.
  'bathroom-2': { u: .988, heading: 270 }, // Door back into Bedroom 2, to the left.
  toilet: { u: .021, heading: 0 }, // Door back toward the passage above.
}

export function flatTwoRadarHeading(direction, roomId) {
  const anchor = FLAT_TWO_RADAR_ANCHORS[roomId]
  const azimuth = Math.atan2(direction.z, direction.x) * 180 / Math.PI
  // Reverse the yaw offset around the calibrated axis, keeping the reference
  // feature fixed while matching the panorama's turn direction on the plan.
  return ((anchor.heading - (azimuth - anchor.u * 360)) % 360 + 360) % 360
}

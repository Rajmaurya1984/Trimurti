const ROOT = '/amenitites'

// Positions are percentages of the full floor-plan image. Lobby is on a different level.
// Panorama U grows clockwise. Radar offsets map the visible window walls and track
// railings to their bearings measured clockwise from the top of the plan.
export const TIRMUTH_AMENITY_SCENES = [
  ['tirmuth-lobby', 'Lobby', 'lobby.jpg', .5],
  ['tirmuth-gym', 'Gym', 'gym_360.jpg', .5, { left: 49, top: 28 }, -180],
  ['tirmuth-indoor-games', 'Indoor Games', 'indoorGame_360.jpg', .65, { left: 39, top: 38 }, 18],
  ['tirmuth-multipurpose-hall', 'Multipurpose Hall', 'multipurposeHall.jpg', .44, { left: 47, top: 72 }, 22],
  ['tirmuth-childrens-play-area', "Children's Play Area", 'childrensPlayArea.jpg', .3, { left: 63, top: 38 }, -18],
  ['tirmuth-gym-track', 'Jogging Track · Gym', 'gymJoggingTrack.jpg', .75, { left: 25, top: 11.2 }, 90],
  ['tirmuth-indoor-games-track', 'Jogging Track · Indoor Games', 'indoorGameJoggingTrack.jpg', .75, { left: 14.5, top: 49 }, 0],
  ['tirmuth-multipurpose-hall-track', 'Jogging Track · Multipurpose Hall', 'multipurposeHallJoggingTrack.jpg', .75, { left: 57, top: 89.4 }, -90],
  ['tirmuth-childrens-play-area-track', "Jogging Track · Children's Play Area", 'childrenplayAreaJoggingTrack.jpg', .75, { left: 84.7, top: 49 }, 180],
].map(([id, name, filename, arrivalU, cameraPosition, radarHeadingOffset]) => ({
  id, name, image: ROOT + '/' + filename,
  cameraPosition, radarHeadingOffset,
  arrivalU, arrivalPitch: 0, arrivalImmediate: true,
}))


const ROOT = '/assets/interiorAmenitites'

export const INTERIOR_AMENITIES_PATH = '/amenities/interior'
export const INTERIOR_AMENITIES_POINTER = { left: 49.844, top: 52.552 }

export const INTERIOR_AMENITY_SCENES = [
  ['interior-gym', 'Gym', 'gym', .5],
  ['interior-indoor-game-1', 'Indoor Games 1', 'indoorGameCam_01', .48],
  // ['interior-indoor-game-2', 'Indoor Games 2', 'indoorGameCam_02', .5],
  ['interior-multipurpose-hall', 'Multipurpose Hall', 'multipurposeHall', .4],
  ['mini-Threater','Mini Threater','miniTheater','.5'],
  ['interior-waiting-lounge', 'Waiting Lounge', 'waitingLounge', .5],
].map(([id, name, file, arrivalU]) => ({
  id, name, image: ROOT + '/' + file + '.jpg',
  arrivalU, arrivalPitch: 0, arrivalImmediate: true,
}))

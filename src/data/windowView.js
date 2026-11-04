// Eyes sit outside the drawing with 180 drawing units of space on each side.
// Coordinates use the original drawing; North faces down on this plan.
export const WINDOW_VIEW_HOTSPOTS = [
 { id: 'north', direction: 'north', x: 1915, y: 3040 },
 { id: 'east', direction: 'east', x: 150, y: 1670 },
 { id: 'south', direction: 'south', x: 1915, y: 300 },
 { id: 'west', direction: 'west', x: 3680, y: 1670 },
]
export const WINDOW_VIEW_FLOORS = [
 { id: 'terrace', label: 'TERRACE', fileStem: 'TERRACE LVL' },
 { id: 'floor-20', label: '20TH FLOOR', fileStem: '20TH LVL' },
 { id: 'floor-15', label: '15TH FLOOR', fileStem: '15TH LVL' },
 { id: 'floor-10', label: '10TH FLOOR', fileStem: '10TH LVL' },
 { id: 'floor-5', label: '5TH FLOOR', fileStem: '5TH LVL' },
]
export const DEFAULT_VIEW_ID = 'terrace'
export const WINDOW_VIEW_TIMES = [
 { id: 'day', label: 'Day', fileToken: 'Day' },
 { id: 'evening', label: 'Evening', fileToken: 'Eve' },
 { id: 'night', label: 'Night', fileToken: 'Night' },
]
// Each eye loads only the photos in its matching direction folder.
export function getWindowViewAssets(floor, time, direction = 'north') {
 const selectedTime = WINDOW_VIEW_TIMES.find(entry => entry.id === time)
 if (!floor || !selectedTime || !['north', 'east', 'south', 'west'].includes(direction)) return null
 const folder = direction[0].toUpperCase() + direction.slice(1)
 const stem = direction === 'north' && floor.id === 'terrace' && time === 'night'
   ? 'TERRACE-LVL' : floor.fileStem
 const image = '/windowView/' + folder + '/' + stem + '_' + selectedTime.fileToken + '_' + folder + '.jpg'
 return { image, preview: image }
}

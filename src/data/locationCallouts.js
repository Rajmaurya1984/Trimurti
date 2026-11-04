// Authored label offsets for the Location panorama, separate from the actual
// landmark coordinates. Positive lift extends the line upward; sufficiently
// negative lift hangs the card below its point, as in the reference tour.
export const LOCATION_CALLOUT_STYLE = {
  'KANDIVALI WEST METRO': { lift: 34, labelOffset: -114 },
  'KANDIVALI STATION': { lift: 86, labelOffset: 160 },
  'KANDIVALI POLICE STATION': { lift: 27, labelOffset: 80 },
  'ST. LAWRENCE': { lift: 76, labelOffset: 10 },
  'OXFORD PUBLIC SCHOOL': { lift: -14, labelOffset: 0 },
  'RAGHULEELA MALL': { lift: -14, labelOffset: -10 },
  SVIS: { lift: -12, labelOffset: 44 },
  'NAMAHA HOSPITAL': { lift: 28, labelOffset: -130 },
  'DMART CHARKOP': { lift: -110, labelOffset: -210 },
  'DAHANUKARWADI METRO': { lift: -110, labelOffset: 0 },
  'OSCAR HOSPITAL': { lift: -164, labelOffset: 68 },
  'KAPADIA HOSPITAL': { lift: 70, labelOffset: 0 },
  'ZENITH HOSPITAL': { lift: -30, labelOffset: 0 },
  'VIPASSANA PAGODA': { lift: 30, labelOffset: 0 },
  // Separate the nearby business labels with fixed rows and leader lengths.
  MINDSPACE: { lift: -124, labelOffset: -35 },
  'Oberoi Garden City': { lift: 30, labelOffset: 0 },
  'INFINITY IT PARK': { lift: 110, labelOffset: 35 },
}

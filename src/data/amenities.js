// Amenities page content: intro copy + the amenity directory.
// Images live in public/assets/amenities/<id>.webp — drop the render in and
// it appears automatically (the grid shows a labelled placeholder until then).

export const AMENITIES_INTRO = {
  eyebrow: 'THE AMENITIES',
  headline: ['Everything you need.', 'Nothing you don’t.'],
  intro:
    'Grounds, lounges and wellness spaces planned for the way the day is actually lived.',
}

export const AMENITIES = [
  {
    id: 'clubhouse',
    name: 'Grand Clubhouse',
    group: 'Social',
    description: 'A double-height lounge for slow mornings and easy evenings.',
    image: '/assets/amenities/clubhouse.webp',
  },
  {
    id: 'pool',
    name: 'Swimming Pool',
    group: 'Wellness',
    description: 'A temperature-controlled pool with a separate children’s splash area.',
    image: '/assets/amenities/pool.webp',
  },
  {
    id: 'gym',
    name: 'Fitness Studio',
    group: 'Wellness',
    description: 'Cardio, strength and free-weight zones open from early to late.',
    image: '/assets/amenities/gym.webp',
  },
  {
    id: 'garden',
    name: 'Landscaped Gardens',
    group: 'Landscape',
    description: 'Layered planting and shaded seating woven through the podium.',
    image: '/assets/amenities/garden.webp',
  },
  {
    id: 'kids',
    name: 'Children’s Play Area',
    group: 'Family',
    description: 'A safe, soft-fall play zone designed for younger residents.',
    image: '/assets/amenities/kids.webp',
  },
  {
    id: 'jogging',
    name: 'Jogging Track',
    group: 'Wellness',
    description: 'A lit, looped path around the project perimeter for daily laps.',
    image: '/assets/amenities/jogging.webp',
  },
  {
    id: 'yoga',
    name: 'Yoga & Meditation Deck',
    group: 'Wellness',
    description: 'A quiet open-air deck set apart from the busier amenities.',
    image: '/assets/amenities/yoga.webp',
  },
  {
    id: 'co-work',
    name: 'Co-working Lounge',
    group: 'Work',
    description: 'Work-from-home desks, meeting nooks and high-speed connectivity.',
    image: '/assets/amenities/co-work.webp',
  },
]

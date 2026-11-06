// Fixed option lists for the question pages. The ids here must match the
// values the Flask backend understands (moods, preference tags, etc.).

export const MOODS = [
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'tired', label: 'Tired', emoji: '😴' },
  { id: 'sad', label: 'Sad', emoji: '😔' },
  { id: 'stressed', label: 'Stressed', emoji: '😩' },
  { id: 'excited', label: 'Excited', emoji: '🤩' },
  { id: 'unsure', label: "I Don't Know", emoji: '😐' },
]

export const PREFERENCES = [
  { id: 'spicy', label: 'Spicy' },
  { id: 'sweet', label: 'Sweet' },
  { id: 'healthy', label: 'Healthy' },
  { id: 'comfort', label: 'Comfort Food' },
  { id: 'fast', label: 'Fast Food' },
  { id: 'protein', label: 'High Protein' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'asian', label: 'Asian Food' },
  { id: 'western', label: 'Western Food' },
  { id: 'light', label: 'Something Light' },
  { id: 'filling', label: 'Something Filling' },
  { id: 'unsure', label: "I Don't Know" },
]

export const COOK_OR_RESTAURANT = [
  {
    id: 'cook',
    label: 'Cook at Home',
    emoji: '🍳',
    description: 'Get a recipe and make it yourself.',
  },
  {
    id: 'restaurant',
    label: 'Find a Restaurant',
    emoji: '🍽',
    description: 'See nearby places that serve it.',
  },
  {
    id: 'either',
    label: 'Either One',
    emoji: '🤷',
    description: "Show both — I'm flexible.",
  },
]

// ----- Stage 2: extra questions -----

// maxMinutes is what gets sent to Flask as "time" (null = no limit).
export const TIME_OPTIONS = [
  { id: 'under-15', label: 'Under 15 minutes', maxMinutes: 15 },
  { id: '15-30', label: '15–30 minutes', maxMinutes: 30 },
  { id: '30-60', label: '30–60 minutes', maxMinutes: 60 },
  { id: 'any', label: 'No time limit', maxMinutes: null },
]

// A food "fits" the budget when its price level has the same number of
// "$" signs or fewer (so a "$" food fits a "$$" budget). Checked in Flask.
export const BUDGET_OPTIONS = [
  { id: '$', label: '$' },
  { id: '$$', label: '$$' },
  { id: '$$$', label: '$$$' },
  { id: 'any', label: 'No preference' },
]

// The ids here are the same tags stored in each food's dietary_tags
// list in MongoDB. Flask only keeps a food if its tags contain every
// restriction the user picked (backend/services/recommendation_service.py).
export const DIETARY_OPTIONS = [
  { id: 'none', label: 'No Restrictions' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'halal', label: 'Halal' },
  { id: 'no-seafood', label: 'No Seafood' },
  { id: 'dairy-free', label: 'Dairy-Free' },
]

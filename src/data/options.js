// Fixed option lists for the question pages. Later these could come from
// the Flask API instead (see services/recommend.js for notes on that).

export const MOODS = [
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'tired', label: 'Tired', emoji: '😴' },
  { id: 'sad', label: 'Sad', emoji: '😔' },
  { id: 'stressed', label: 'Stressed', emoji: '😩' },
  { id: 'excited', label: 'Excited', emoji: '🤩' },
  { id: 'unsure', label: "I Don't Know", emoji: '😐' },
]

// `phrase` is how the preference reads inside a sentence, used by
// services/explanation.js ("...and want comfort food").
export const PREFERENCES = [
  { id: 'spicy', label: 'Spicy', phrase: 'something spicy' },
  { id: 'sweet', label: 'Sweet', phrase: 'something sweet' },
  { id: 'healthy', label: 'Healthy', phrase: 'something healthy' },
  { id: 'comfort', label: 'Comfort Food', phrase: 'comfort food' },
  { id: 'fast', label: 'Fast Food', phrase: 'something fast' },
  { id: 'protein', label: 'High Protein', phrase: 'something high in protein' },
  { id: 'vegetarian', label: 'Vegetarian', phrase: 'vegetarian food' },
  { id: 'asian', label: 'Asian Food', phrase: 'Asian food' },
  { id: 'western', label: 'Western Food', phrase: 'Western food' },
  { id: 'light', label: 'Something Light', phrase: 'something light' },
  { id: 'filling', label: 'Something Filling', phrase: 'something filling' },
  { id: 'unsure', label: "I Don't Know", phrase: '' },
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

// maxMinutes = the longest total cooking time that still "fits".
// null means no limit.
export const TIME_OPTIONS = [
  { id: 'under-15', label: 'Under 15 minutes', maxMinutes: 15 },
  { id: '15-30', label: '15–30 minutes', maxMinutes: 30 },
  { id: '30-60', label: '30–60 minutes', maxMinutes: 60 },
  { id: 'any', label: 'No time limit', maxMinutes: null },
]

// A food "fits" the budget when its price level has the same number of
// "$" signs or fewer (so a "$" food fits a "$$" budget).
export const BUDGET_OPTIONS = [
  { id: '$', label: '$' },
  { id: '$$', label: '$$' },
  { id: '$$$', label: '$$$' },
  { id: 'any', label: 'No preference' },
]

// The ids here are the same tags used in each food's `dietary` array in
// data/foods.js. A food is only allowed if its `dietary` array contains
// every restriction the user picked (see services/recommend.js).
export const DIETARY_OPTIONS = [
  { id: 'none', label: 'No Restrictions' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'halal-friendly', label: 'Halal' },
  { id: 'no-seafood', label: 'No Seafood' },
  { id: 'dairy-free', label: 'Dairy-Free' },
]

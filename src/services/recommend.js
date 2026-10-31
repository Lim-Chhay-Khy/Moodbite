import foods, { getFoodById } from '../data/foods.js'
import { TIME_OPTIONS } from '../data/options.js'
import { buildExplanation } from './explanation.js'

// ---------------------------------------------------------------------
// Stage 2 recommendation logic (still rule-based, no AI).
//
// Step 1 — REMOVE foods that can't work at all (hard filters):
//   • foods that break a dietary restriction the user picked
//   • restaurant-only foods if the user wants to cook at home
//   • home-only foods if the user wants a restaurant
//
// Step 2 — SCORE every food that is left:
//   Mood matches ............................ +3
//   Each craving (preference) that matches .. +3
//   Fits the cook / restaurant choice ........ +2
//   Fits the time limit ...................... +2
//   Fits the budget .......................... +1
//   Fits the dietary preferences ............. +3
//
// Step 3 — sort by score (highest first) and return the top 3.
// Because we sort instead of requiring a perfect match, the user always
// gets the CLOSEST foods, even if nothing ticks every box.
//
// In Stage 6 the inside of this function can be replaced by an AI model,
// but the input (the user's answers) and output (a list of foods) stay
// the same, so the pages don't need to change.
// ---------------------------------------------------------------------

export const POINTS = {
  mood: 3,
  preference: 3,
  cookingChoice: 2,
  time: 2,
  budget: 1,
  dietary: 3,
}

const POPULAR_FOOD_IDS = [
  'chicken-fried-rice',
  'margherita-pizza',
  'pad-thai',
  'grilled-chicken-bowl',
  'amok',
]

// ----- Hard filters (true = keep the food) -----

export function followsDietary(food, dietary = []) {
  const restrictions = dietary.filter((item) => item !== 'none')
  // The food must be safe for EVERY restriction the user picked.
  return restrictions.every((restriction) => food.dietary.includes(restriction))
}

export function isPossibleForChoice(food, cookOrEat) {
  if (cookOrEat === 'cook') return food.canCook
  if (cookOrEat === 'restaurant') return food.availableAtRestaurant
  return true // "either" or not answered
}

// ----- Soft checks (used for points) -----

function fitsCookingChoice(food, cookOrEat) {
  if (cookOrEat === 'cook' || cookOrEat === 'restaurant') {
    return isPossibleForChoice(food, cookOrEat)
  }
  // "Either one": reward foods that really do offer both options.
  return food.canCook && food.availableAtRestaurant
}

export function fitsTime(food, timeLimit, cookOrEat) {
  const option = TIME_OPTIONS.find((item) => item.id === timeLimit)
  if (!option || option.maxMinutes === null) return true // no limit
  // Eating out (or a restaurant-only dish) means no cooking time.
  if (cookOrEat === 'restaurant' || food.cookingTime === null) return true
  return food.cookingTime <= option.maxMinutes
}

export function fitsBudget(food, budget) {
  if (!budget || budget === 'any') return true
  // "$" has 1 character, "$$" has 2... so compare the lengths.
  return food.priceLevel.length <= budget.length
}

// ----- Scoring -----

function scoreFood(food, answers) {
  const { mood, preferences, cookOrEat, timeLimit, budget, dietary } = answers
  const matchedPreferences = preferences.filter((item) => food.preferences.includes(item))
  const checks = {
    mood: Boolean(mood) && food.moods.includes(mood),
    time: fitsTime(food, timeLimit, cookOrEat),
    budget: fitsBudget(food, budget),
  }

  let score = 0
  if (checks.mood) score += POINTS.mood
  score += matchedPreferences.length * POINTS.preference
  if (fitsCookingChoice(food, cookOrEat)) score += POINTS.cookingChoice
  if (checks.time) score += POINTS.time
  if (checks.budget) score += POINTS.budget
  if (followsDietary(food, dietary)) score += POINTS.dietary // always true after filtering

  // "Perfect match" = right mood, at least one craving (if any were
  // picked), and within time and budget.
  const isPerfectMatch =
    checks.mood &&
    (preferences.length === 0 || matchedPreferences.length > 0) &&
    checks.time &&
    checks.budget

  return { score, matchedPreferences, checks, isPerfectMatch }
}

function getPopularPicks(limit) {
  return POPULAR_FOOD_IDS.map(getFoodById)
    .filter(Boolean)
    .slice(0, limit)
    .map((food) => ({
      ...food,
      score: 0,
      isPerfectMatch: false,
      reason: buildExplanation(food, { surpriseMe: true }),
    }))
}

// answers = { mood, preferences, cookOrEat, timeLimit, budget, dietary, surpriseMe }
// Returns up to `limit` foods, each with extra fields:
//   score, isPerfectMatch, reason (the "Why we recommend this" sentence)
export function getRecommendations(answers, limit = 3) {
  // "Surprise Me", or the user landed here without answering anything.
  if (answers.surpriseMe || !answers.mood) {
    return getPopularPicks(limit)
  }

  const cleanAnswers = {
    ...answers,
    preferences: (answers.preferences || []).filter((item) => item !== 'unsure'),
    dietary: answers.dietary || [],
  }

  const allowedFoods = foods
    .filter((food) => followsDietary(food, cleanAnswers.dietary))
    .filter((food) => isPossibleForChoice(food, cleanAnswers.cookOrEat))

  return allowedFoods
    .map((food) => ({ food, result: scoreFood(food, cleanAnswers) }))
    .sort((a, b) => b.result.score - a.result.score)
    .slice(0, limit)
    .map(({ food, result }) => ({
      ...food,
      score: result.score,
      isPerfectMatch: result.isPerfectMatch,
      reason: buildExplanation(food, cleanAnswers, result),
    }))
}

import { PREFERENCES } from '../data/options.js'

// ---------------------------------------------------------------------
// Builds the "Why we recommend this" text on each food card, e.g.
//
//   "You said you are feeling tired and want comfort food.
//    Chicken Fried Rice is comforting, filling, and easy to prepare.
//    It takes about 25 minutes to make. It fits your $ budget."
//
// It is made of three short sentences:
//   1. what the user told us   (mood + matching cravings)
//   2. why this food fits      (words based on the food's tags)
//   3. the practical part      (cook / restaurant, time, budget)
// ---------------------------------------------------------------------

const MOOD_WORDS = {
  happy: 'happy',
  tired: 'tired',
  sad: 'a little down',
  stressed: 'stressed',
  excited: 'excited',
}

// How each food tag is described in sentence 2.
const TRAIT_WORDS = {
  comfort: 'comforting',
  filling: 'filling',
  light: 'light',
  healthy: 'balanced',
  protein: 'high in protein',
  spicy: 'spicy',
  sweet: 'sweet',
  fast: 'quick',
}

// ["a"] -> "a",  ["a","b"] -> "a and b",  ["a","b","c"] -> "a, b, and c"
export function joinWords(words) {
  if (words.length <= 1) return words.join('')
  if (words.length === 2) return `${words[0]} and ${words[1]}`
  return `${words.slice(0, -1).join(', ')}, and ${words[words.length - 1]}`
}

function describeUser(mood, matchedPreferences, moodMatched) {
  const cravings = matchedPreferences
    .map((id) => PREFERENCES.find((item) => item.id === id)?.phrase)
    .filter(Boolean)
  const wants = cravings.length > 0 ? ` and want ${joinWords(cravings)}` : ''

  if (mood === 'unsure') {
    return cravings.length > 0
      ? `You weren't sure how you feel, but you want ${joinWords(cravings)}.`
      : "You weren't sure how you feel, so we picked something easy to enjoy."
  }
  if (moodMatched) {
    return `You said you are feeling ${MOOD_WORDS[mood]}${wants}.`
  }
  if (cravings.length > 0) {
    return `You said you want ${joinWords(cravings)}.`
  }
  return 'This was the closest match to your answers.'
}

function describeFood(food, cookOrEat) {
  const traits = food.preferences.map((tag) => TRAIT_WORDS[tag]).filter(Boolean).slice(0, 2)
  if (food.difficulty === 'Easy' && food.canCook && cookOrEat !== 'restaurant') {
    traits.push('easy to prepare')
  }
  if (traits.length === 0) return `${food.name} is a ${food.cuisine} favorite.`
  return `${food.name} is ${joinWords(traits)}.`
}

function describePractical(food, answers, checks) {
  const { cookOrEat, budget } = answers
  let sentence

  if (cookOrEat === 'restaurant' || !food.canCook) {
    sentence = 'You can find it at restaurants nearby'
  } else if (food.cookingTime <= 15) {
    sentence = `It only takes about ${food.cookingTime} minutes to make`
  } else {
    sentence = `It takes about ${food.cookingTime} minutes to make`
  }
  sentence += checks.time ? '.' : ', which is a bit longer than you wanted.'

  if (budget && budget !== 'any') {
    sentence += checks.budget
      ? ` It fits your ${budget} budget.`
      : ` It costs a little more than your ${budget} budget.`
  }
  return sentence
}

// food:    a food from data/foods.js
// answers: the user's answers from AppContext
// result:  { matchedPreferences, checks } from scoreFood() in recommend.js
export function buildExplanation(food, answers, result) {
  if (answers.surpriseMe || !result) {
    return `A popular pick for any mood. ${describeFood(food, answers.cookOrEat)}`
  }
  return [
    describeUser(answers.mood, result.matchedPreferences, result.checks.mood),
    describeFood(food, answers.cookOrEat),
    describePractical(food, answers, result.checks),
  ].join(' ')
}

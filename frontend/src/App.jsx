import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import MoodSelect from './pages/MoodSelect.jsx'
import PreferenceSelect from './pages/PreferenceSelect.jsx'
import CookOrRestaurant from './pages/CookOrRestaurant.jsx'
import Results from './pages/Results.jsx'
import RecipeDetails from './pages/RecipeDetails.jsx'
import Restaurants from './pages/Restaurants.jsx'
import Favorites from './pages/Favorites.jsx'
import About from './pages/About.jsx'
import NotFound from './pages/NotFound.jsx'
import { AppProvider } from './context/AppContext.jsx'

// Stage 2 routes. Stage 4 adds /login and /register.
export default function App() {
  return (
    <AppProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mood" element={<MoodSelect />} />
        <Route path="/preferences" element={<PreferenceSelect />} />
        <Route path="/choice" element={<CookOrRestaurant />} />
        <Route path="/recommendations" element={<Results />} />
        <Route path="/recipe/:id" element={<RecipeDetails />} />
        <Route path="/restaurants/:foodId" element={<Restaurants />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/about" element={<About />} />

        {/* Stage 1 URLs, kept so old links/bookmarks still work */}
        <Route path="/cook-or-restaurant" element={<Navigate to="/choice" replace />} />
        <Route path="/results" element={<Navigate to="/recommendations" replace />} />

        {/* Anything else */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppProvider>
  )
}

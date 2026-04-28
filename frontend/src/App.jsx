import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import ChallengesPage from './pages/ChallengesPage.jsx'
import StatsPage from './pages/StatsPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import LeaderboardPage from './pages/LeaderboardPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/challenges" element={<ChallengesPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

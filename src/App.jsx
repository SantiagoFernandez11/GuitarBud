import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Songs from './pages/Songs'
import SongForm from './pages/SongForm'
import SongDetails from './pages/SongDetails'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/songs"
                element={
                  <ProtectedRoute>
                    <Songs />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/songs/new"
                element={
                  <ProtectedRoute>
                    <SongForm />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/songs/:id"
                element={
                  <ProtectedRoute>
                    <SongDetails />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/songs/:id/edit"
                element={
                  <ProtectedRoute>
                    <SongForm />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

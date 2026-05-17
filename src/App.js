import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
import Admin from './pages/Admin'
import AdminNew from './pages/AdminNew'
import AdminQuiz from './pages/AdminQuiz'
import Signup from './pages/Signup'
import Login from './pages/Login'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quiz/:id" element={<Quiz />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/new" element={<AdminNew />} />
        <Route path="/admin/quiz/:id" element={<AdminQuiz />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
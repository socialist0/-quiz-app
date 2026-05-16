import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
import Admin from './pages/Admin'
import AdminNew from './pages/AdminNew'
import AdminQuiz from './pages/AdminQuiz'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quiz/:id" element={<Quiz />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/new" element={<AdminNew />} />
        <Route path="/admin/quiz/:id" element={<AdminQuiz />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
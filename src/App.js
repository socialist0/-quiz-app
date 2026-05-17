import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
import Admin from './pages/Admin'
import AdminNew from './pages/AdminNew'
import AdminQuiz from './pages/AdminQuiz'
import AdminUsers from './pages/AdminUsers'
import AdminUser from './pages/AdminUser'
import AdminLayout from './pages/AdminLayout'
import Signup from './pages/Signup'
import Login from './pages/Login'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quiz/:id" element={<Quiz />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout><Admin /></AdminLayout>} />
        <Route path="/admin/quizzes" element={<AdminLayout><Admin /></AdminLayout>} />
        <Route path="/admin/new" element={<AdminLayout><AdminNew /></AdminLayout>} />
        <Route path="/admin/quiz/:id" element={<AdminLayout><AdminQuiz /></AdminLayout>} />
        <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
        <Route path="/admin/user/:id" element={<AdminLayout><AdminUser /></AdminLayout>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
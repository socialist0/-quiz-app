import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabase'

function AdminLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (!userData || userData.role !== 'admin') {
        navigate('/')
        return
      }

      setChecking(false)
    }
    checkAdmin()
  }, [navigate])

  const menuItems = [
    { label: '퀴즈 관리', path: '/admin/quizzes' },
    { label: '회원 관리', path: '/admin/users' },
  ]

  if (checking) return <p style={{ padding: '40px' }}>확인 중...</p>

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{
        width: '220px',
        backgroundColor: '#1e1e2e',
        padding: '30px 0',
        flexShrink: 0,
      }}>
        <h2 style={{
          color: 'white',
          fontSize: '18px',
          padding: '0 20px',
          marginBottom: '30px',
        }}>
          관리자
        </h2>
        {menuItems.map(item => (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              padding: '14px 20px',
              cursor: 'pointer',
              fontSize: '15px',
              color: location.pathname.startsWith(item.path) ? 'white' : '#aaa',
              backgroundColor: location.pathname.startsWith(item.path) ? '#4f46e5' : 'transparent',
              borderRadius: '6px',
              margin: '4px 10px',
            }}
          >
            {item.label}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, padding: '40px', backgroundColor: '#f9fafb' }}>
        {children}
      </div>
    </div>
  )
}

export default AdminLayout
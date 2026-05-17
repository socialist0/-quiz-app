import { useNavigate, useLocation } from 'react-router-dom'

function AdminLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { label: '퀴즈 관리', path: '/admin/quizzes' },
    { label: '회원 관리', path: '/admin/users' },
  ]

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
import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabase'

function Home() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setUser(userData)
      }

      const { data: quizData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
      setQuizzes(quizData || [])

      setLoading(false)
    }
    init()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const handleQuizClick = (quizId) => {
    if (!user) {
      navigate('/login')
    } else {
      navigate(`/quiz/${quizId}`)
    }
  }

  const formatNumber = (n) => String(n).padStart(6, '0')

  const typeMap = { hour: 'H', day: 'D', week: 'W', month: 'M' }
  const typeColors = { hour: '#fef3c7', day: '#dcfce7', week: '#dbeafe', month: '#f3e8ff' }
  const typeTextColors = { hour: '#d97706', day: '#16a34a', week: '#1d4ed8', month: '#7c3aed' }

  if (loading) return null

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      {/* 상단 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        {user ? (
          <div>
            <h2 style={{ margin: 0 }}>{user.nickname}</h2>
            <p style={{ margin: '4px 0 0', color: '#666' }}>보유 포인트: {user.points?.toLocaleString()}P</p>
          </div>
        ) : (
          <h2 style={{ margin: 0 }}>퀴즈 배팅</h2>
        )}

        {user ? (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link to="/mypage" style={{ fontSize: '14px', color: '#4f46e5', textDecoration: 'none' }}>
              마이페이지
            </Link>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                cursor: 'pointer',
                border: '1px solid #ddd',
                borderRadius: '6px',
                backgroundColor: 'white',
              }}
            >
              로그아웃
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link to="/login" style={{ fontSize: '14px', color: '#4f46e5', textDecoration: 'none' }}>
              로그인
            </Link>
            <Link
              to="/signup"
              style={{
                fontSize: '14px',
                color: 'white',
                backgroundColor: '#4f46e5',
                padding: '8px 14px',
                borderRadius: '6px',
                textDecoration: 'none',
              }}
            >
              회원가입
            </Link>
          </div>
        )}
      </div>

      {/* 퀴즈 목록 */}
      <h3>참여 가능한 퀴즈</h3>
      {quizzes.length === 0 ? (
        <p style={{ color: '#999' }}>현재 참여 가능한 퀴즈가 없어요.</p>
      ) : (
        quizzes.map(quiz => (
          <div
            key={quiz.id}
            onClick={() => handleQuizClick(quiz.id)}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '12px',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#999', fontSize: '13px' }}>#{formatNumber(quiz.quiz_number)}</span>
                {quiz.quiz_type && (
                  <span style={{
                    padding: '2px 7px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: typeColors[quiz.quiz_type] || '#f3f4f6',
                    color: typeTextColors[quiz.quiz_type] || '#555',
                  }}>
                    {typeMap[quiz.quiz_type] || quiz.quiz_type}
                  </span>
                )}
              </div>
              <span style={{ color: '#999', fontSize: '13px' }}>최대 {quiz.max_bet?.toLocaleString()}P</span>
            </div>
            <h4 style={{ margin: '8px 0 4px' }}>{quiz.title}</h4>
            <p style={{ margin: 0, color: '#555', fontSize: '14px' }}>{quiz.content}</p>
            {!user && (
              <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#4f46e5' }}>
                로그인 후 참여할 수 있어요 →
              </p>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default Home
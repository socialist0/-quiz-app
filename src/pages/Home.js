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
      // 로그인 확인 (없어도 홈은 보여줌)
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        // 유저 정보 가져오기
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setUser(userData)
      }

      // 오픈된 퀴즈 목록 가져오기
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

  if (loading) return null

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      {/* 상단 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        {/* 왼쪽: 유저 정보 or 앱 이름 */}
        {user ? (
          <div>
            <h2 style={{ margin: 0 }}>{user.nickname}</h2>
            <p style={{ margin: '4px 0 0', color: '#666' }}>보유 포인트: {user.points?.toLocaleString()}P</p>
          </div>
        ) : (
          <h2 style={{ margin: 0 }}>퀴즈 배팅</h2>
        )}

        {/* 오른쪽: 로그인 상태에 따라 다른 링크 */}
        {user ? (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link
              to="/mypage"
              style={{ fontSize: '14px', color: '#4f46e5', textDecoration: 'none' }}
            >
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
            <Link
              to="/login"
              style={{ fontSize: '14px', color: '#4f46e5', textDecoration: 'none' }}
            >
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
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#999', fontSize: '13px' }}>#{quiz.quiz_number}</span>
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
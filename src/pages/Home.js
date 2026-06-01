import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

function Home() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      // 로그인 확인
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/login')
        return
      }

      // 유저 정보 가져오기
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
      setUser(userData)

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
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (loading) return <p>로딩 중...</p>

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      {/* 상단 유저 정보 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0 }}>{user?.nickname}</h2>
          <p style={{ margin: '4px 0 0', color: '#666' }}>보유 포인트: {user?.points?.toLocaleString()}P</p>
        </div>
        <button onClick={handleLogout} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          로그아웃
        </button>
      </div>

      {/* 퀴즈 목록 */}
      <h3>참여 가능한 퀴즈</h3>
      {quizzes.length === 0 ? (
        <p style={{ color: '#999' }}>현재 참여 가능한 퀴즈가 없어요.</p>
      ) : (
        quizzes.map(quiz => (
          <div
            key={quiz.id}
            onClick={() => navigate(`/quiz/${quiz.id}`)}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '12px',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#999', fontSize: '13px' }}>#{quiz.quiz_number}</span>
              <span style={{ color: '#999', fontSize: '13px' }}>최대 {quiz.max_bet?.toLocaleString()}P</span>
            </div>
            <h4 style={{ margin: '8px 0 4px' }}>{quiz.title}</h4>
            <p style={{ margin: 0, color: '#555', fontSize: '14px' }}>{quiz.content}</p>
          </div>
        ))
      )}
    </div>
  )
}

export default Home
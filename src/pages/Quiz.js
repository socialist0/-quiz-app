import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabase'

function Quiz() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [betAmount, setBetAmount] = useState('')
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [alreadyBet, setAlreadyBet] = useState(false)

  useEffect(() => {
    const init = async () => {
      // 로그인 확인
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/login')
        return
      }

      // 유저 정보
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
      setUser(userData)

      // 퀴즈 정보
      const { data: quizData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', id)
        .single()
      setQuiz(quizData)

      // 이미 배팅했는지 확인
      const { data: betData } = await supabase
        .from('bets')
        .select('*')
        .eq('quiz_id', id)
        .eq('user_id', session.user.id)
        .single()
      if (betData) setAlreadyBet(true)

      setLoading(false)
    }
    init()
  }, [id, navigate])

  const handleSubmit = async () => {
    setError('')
    const amount = parseInt(betAmount)

    if (!amount || amount <= 0) return setError('배팅 포인트를 입력해주세요.')
    if (amount > quiz.max_bet) return setError(`최대 ${quiz.max_bet.toLocaleString()}P까지 배팅 가능해요.`)
    if (amount > user.points) return setError('포인트가 부족해요.')
    if (!answer.trim()) return setError('답변을 입력해주세요.')

    setSubmitting(true)

    // 배팅 등록
    const { error: betError } = await supabase
      .from('bets')
      .insert({
        quiz_id: quiz.id,
        user_id: user.id,
        amount,
        answer: answer.trim()
      })

    if (betError) {
      setError('배팅 중 오류가 발생했어요.')
      setSubmitting(false)
      return
    }

    // 포인트 차감
    await supabase
      .from('users')
      .update({ points: user.points - amount })
      .eq('id', user.id)

    navigate('/')
  }

  if (loading) return <p>로딩 중...</p>
  if (!quiz) return <p>퀴즈를 찾을 수 없어요.</p>

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      {/* 뒤로가기 */}
      <button onClick={() => navigate('/')} style={{ marginBottom: '16px', cursor: 'pointer' }}>
        ← 홈으로
      </button>

      {/* 퀴즈 정보 */}
      <div style={{ marginBottom: '24px' }}>
        <span style={{ color: '#999', fontSize: '13px' }}>#{quiz.quiz_number}</span>
        <h2 style={{ margin: '8px 0' }}>{quiz.title}</h2>
        <p style={{ color: '#555' }}>{quiz.content}</p>
        {quiz.image_url && (
          <img src={quiz.image_url} alt="퀴즈 이미지" style={{ width: '100%', borderRadius: '8px', marginTop: '12px' }} />
        )}
      </div>

      {/* 마감일 */}
      <p style={{ color: '#999', fontSize: '13px' }}>
        마감: {new Date(quiz.end_at).toLocaleString('ko-KR')}
      </p>

      {/* 이미 배팅한 경우 */}
      {alreadyBet ? (
        <div style={{ background: '#f0f0f0', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#555' }}>이미 배팅에 참여했어요!</p>
        </div>
      ) : quiz.status !== 'open' ? (
        <div style={{ background: '#f0f0f0', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#555' }}>현재 참여할 수 없는 퀴즈예요.</p>
        </div>
      ) : (
        <div>
          {/* 보유 포인트 */}
          <p style={{ color: '#666' }}>보유 포인트: <strong>{user?.points?.toLocaleString()}P</strong></p>

          {/* 배팅 포인트 입력 */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
              배팅 포인트 (최대 {quiz.max_bet?.toLocaleString()}P)
            </label>
            <input
              type="number"
              value={betAmount}
              onChange={e => setBetAmount(e.target.value)}
              placeholder="배팅할 포인트 입력"
              min="1"
              max={quiz.max_bet}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}
            />
          </div>

          {/* 답변 입력 */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
              답변
            </label>
            <input
              type="text"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="답변을 입력하세요"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}
            />
          </div>

          {/* 에러 메시지 */}
          {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}

          {/* 제출 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{ width: '100%', padding: '12px', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}
          >
            {submitting ? '제출 중...' : '배팅하기'}
          </button>
        </div>
      )}
    </div>
  )
}

export default Quiz
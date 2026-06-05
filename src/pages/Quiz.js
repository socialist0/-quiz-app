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
  const [existingBet, setExistingBet] = useState(null) // 기존 배팅 정보
  const [editMode, setEditMode] = useState(false)      // 수정 모드

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
      setUser(userData)

      const { data: quizData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', id)
        .single()
      setQuiz(quizData)

      const { data: betData } = await supabase
        .from('bets')
        .select('*')
        .eq('quiz_id', id)
        .eq('user_id', session.user.id)
        .single()
      if (betData) {
        setExistingBet(betData)
        setBetAmount(String(betData.amount))
        setAnswer(betData.answer)
      }

      setLoading(false)
    }
    init()
  }, [id, navigate])

  const handleSubmit = async () => {
    setError('')
    const amount = parseInt(betAmount)

    if (!amount || amount <= 0) return setError('배팅 포인트를 입력해주세요.')
    if (amount > quiz.max_bet) return setError(`최대 ${quiz.max_bet.toLocaleString()}P까지 배팅 가능해요.`)
    if (!answer.trim()) return setError('답변을 입력해주세요.')

    // 수정 시: 현재 보유 포인트 = 실제보유 + 기존배팅 (환불 개념)
    const availablePoints = existingBet
      ? user.points + existingBet.amount
      : user.points
    if (amount > availablePoints) return setError('포인트가 부족해요.')

    setSubmitting(true)

    if (existingBet) {
      // 배팅 수정
      const { error: betError } = await supabase
        .from('bets')
        .update({ amount, answer: answer.trim() })
        .eq('id', existingBet.id)

      if (betError) {
        setError('수정 중 오류가 발생했어요.')
        setSubmitting(false)
        return
      }

      // 포인트 차액 조정 (기존 배팅 환불 후 새 배팅 차감)
      const pointDiff = existingBet.amount - amount
      await supabase
        .from('users')
        .update({ points: user.points + pointDiff })
        .eq('id', user.id)

      setExistingBet({ ...existingBet, amount, answer: answer.trim() })
      setEditMode(false)
      setUser(prev => ({ ...prev, points: prev.points + pointDiff }))
    } else {
      // 신규 배팅
      const { error: betError } = await supabase
        .from('bets')
        .insert({ quiz_id: quiz.id, user_id: user.id, amount, answer: answer.trim() })

      if (betError) {
        setError('배팅 중 오류가 발생했어요.')
        setSubmitting(false)
        return
      }

      await supabase
        .from('users')
        .update({ points: user.points - amount })
        .eq('id', user.id)

      navigate('/')
    }

    setSubmitting(false)
  }

  if (loading) return <p>로딩 중...</p>
  if (!quiz) return <p>퀴즈를 찾을 수 없어요.</p>

  const isOpen = quiz.status === 'open'

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      {/* 뒤로가기 */}
      <button onClick={() => navigate(-1)} style={{ marginBottom: '16px', cursor: 'pointer' }}>
        ← 뒤로가기
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

      <p style={{ color: '#999', fontSize: '13px' }}>
        마감: {new Date(quiz.end_at).toLocaleString('ko-KR')}
      </p>

      {/* 이미 배팅 + 수정 모드 아님 → 내 배팅 현황 표시 */}
      {existingBet && !editMode ? (
        <div style={{ background: '#f8f8f8', borderRadius: '8px', padding: '20px' }}>
          <h4 style={{ margin: '0 0 12px', color: '#333' }}>내 배팅 현황</h4>
          <p style={{ margin: '6px 0', color: '#555' }}>
            배팅 포인트: <strong>{existingBet.amount.toLocaleString()}P</strong>
          </p>
          <p style={{ margin: '6px 0', color: '#555' }}>
            제출한 답변: <strong>{existingBet.answer}</strong>
          </p>
          {existingBet.is_correct === true && (
            <p style={{ margin: '10px 0 0', color: '#16a34a', fontWeight: 'bold' }}>
              🎉 정답! +{existingBet.payout?.toLocaleString()}P 지급됨
            </p>
          )}
          {existingBet.is_correct === false && (
            <p style={{ margin: '10px 0 0', color: '#dc2626', fontWeight: 'bold' }}>
              😢 오답
            </p>
          )}
          {isOpen && (
            <button
              onClick={() => setEditMode(true)}
              style={{
                marginTop: '16px',
                width: '100%',
                padding: '10px',
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              ✏️ 배팅 수정하기
            </button>
          )}
        </div>
      ) : quiz.status !== 'open' && !existingBet ? (
        <div style={{ background: '#f0f0f0', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#555' }}>현재 참여할 수 없는 퀴즈예요.</p>
        </div>
      ) : (
        <div>
          <p style={{ color: '#666' }}>
            보유 포인트: <strong>
              {existingBet
                ? (user.points + existingBet.amount).toLocaleString()
                : user?.points?.toLocaleString()}P
            </strong>
            {existingBet && <span style={{ color: '#999', fontSize: '13px' }}> (기존 배팅 {existingBet.amount.toLocaleString()}P 포함)</span>}
          </p>

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

          {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '10px' }}>
            {editMode && (
              <button
                onClick={() => {
                  setEditMode(false)
                  setBetAmount(String(existingBet.amount))
                  setAnswer(existingBet.answer)
                  setError('')
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#ccc',
                  color: '#333',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  cursor: 'pointer',
                }}
              >
                취소
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                flex: 2,
                padding: '12px',
                background: '#333',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              {submitting ? '처리 중...' : editMode ? '수정 완료' : '배팅하기'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Quiz
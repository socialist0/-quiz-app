import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabase'

function AdminQuiz() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [bets, setBets] = useState([])
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [settling, setSettling] = useState(false)

  useEffect(() => {
    async function init() {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', id)
        .single()
      if (!error) {
        setQuiz(data)
        setAnswer(data.answer || '')
      }

      const { data: betData } = await supabase
        .from('bets')
        .select('*, users(nickname, points)')
        .eq('quiz_id', id)
        .order('created_at', { ascending: true })
      setBets(betData || [])

      setLoading(false)
    }
    init()
  }, [id])

  async function fetchQuiz() {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .single()
    if (!error) {
      setQuiz(data)
      setAnswer(data.answer || '')
    }

    const { data: betData } = await supabase
      .from('bets')
      .select('*, users(nickname, points)')
      .eq('quiz_id', id)
      .order('created_at', { ascending: true })
    setBets(betData || [])
  }

  async function runSettlement(currentAnswer) {
    const { data: latestBets } = await supabase
      .from('bets')
      .select('*')
      .eq('quiz_id', id)

    if (!latestBets || latestBets.length === 0) return

    const totalBetAmount = latestBets.reduce((sum, b) => sum + b.amount, 0)
    const rake = Math.floor(totalBetAmount * (quiz.rake_percent / 100))
    const prizePool = totalBetAmount - rake

    const correctBets = latestBets.filter(
      b => b.answer.trim() === currentAnswer.trim()
    )

    for (const bet of latestBets) {
      const isCorrect = correctBets.some(c => c.id === bet.id)
      await supabase
        .from('bets')
        .update({ is_correct: isCorrect, payout: 0 })
        .eq('id', bet.id)
    }

    if (correctBets.length === 0) return

    const payoutPerWinner = Math.floor(prizePool / correctBets.length)

    for (const bet of correctBets) {
      await supabase
        .from('bets')
        .update({ payout: payoutPerWinner })
        .eq('id', bet.id)

      const { data: userData } = await supabase
        .from('users')
        .select('points')
        .eq('id', bet.user_id)
        .single()

      await supabase
        .from('users')
        .update({ points: userData.points + payoutPerWinner })
        .eq('id', bet.user_id)
    }
  }

  async function handleSaveAnswer() {
    if (!answer.trim()) {
      setMessage('❌ 정답을 입력해주세요.')
      return
    }

    setSettling(true)
    setMessage('')

    const { error } = await supabase
      .from('quizzes')
      .update({ answer })
      .eq('id', id)

    if (error) {
      setMessage('❌ 오류: ' + error.message)
      setSettling(false)
      return
    }

    await new Promise(resolve => setTimeout(resolve, 500))

    if (quiz.settlement_type === 'with_answer') {
      await runSettlement(answer)
      setMessage('✅ 정답 저장 및 정산 완료!')
    } else {
      setMessage('✅ 정답이 저장되었습니다! (정산은 예약된 시간에 자동 실행)')
    }

    setSettling(false)
    fetchQuiz()
  }

  async function handleManualSettle() {
    if (!quiz.answer || !quiz.answer.trim()) {
      setMessage('❌ 먼저 정답을 저장해주세요.')
      return
    }
    if (!window.confirm('정산을 실행하시겠습니까?')) return

    setSettling(true)
    setMessage('')
    await runSettlement(quiz.answer)
    setMessage('✅ 정산 완료!')
    setSettling(false)
    fetchQuiz()
  }

  async function handleDelete() {
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    const { error } = await supabase.from('quizzes').delete().eq('id', id)
    if (!error) navigate('/admin')
    else setMessage('❌ 오류: ' + error.message)
  }

  if (loading) return null
  if (!quiz) return null

  const formatNumber = (n) => String(n).padStart(6, '0')

  const typeMap = { hour: 'H - Hour', day: 'D - Day', week: 'W - Week', month: 'M - Month' }
  const typeColors = { hour: '#fef3c7', day: '#dcfce7', week: '#dbeafe', month: '#f3e8ff' }
  const typeTextColors = { hour: '#d97706', day: '#16a34a', week: '#1d4ed8', month: '#7c3aed' }

  const labelStyle = { fontSize: '15px', fontWeight: 'bold' }
  const valueStyle = { fontSize: '16px', marginTop: '4px', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '6px' }
  const inputStyle = {
    display: 'block',
    width: '100%',
    marginTop: '6px',
    padding: '10px',
    fontSize: '16px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
  }

  const totalBet = bets.reduce((sum, b) => sum + b.amount, 0)
  const correctCount = bets.filter(b => b.is_correct === true).length
  const totalPayout = bets.reduce((sum, b) => sum + (b.payout || 0), 0)
  const alreadySettled = bets.some(b => b.is_correct !== null)

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ fontSize: '28px', margin: 0 }}>퀴즈 #{formatNumber(quiz.quiz_number)}</h1>
          {quiz.quiz_type && (
            <span style={{
              padding: '4px 12px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 'bold',
              backgroundColor: typeColors[quiz.quiz_type] || '#f3f4f6',
              color: typeTextColors[quiz.quiz_type] || '#555',
            }}>
              {typeMap[quiz.quiz_type] || quiz.quiz_type}
            </span>
          )}
        </div>
        <button
          onClick={() => navigate('/admin')}
          style={{ padding: '10px 20px', fontSize: '15px', borderRadius: '8px', border: '1px solid #ccc', cursor: 'pointer' }}
        >
          목록으로
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>

        <div>
          <label style={labelStyle}>퀴즈 제목</label>
          <div style={valueStyle}>{quiz.title}</div>
        </div>

        <div>
          <label style={labelStyle}>퀴즈 본문</label>
          <div style={{ ...valueStyle, whiteSpace: 'pre-wrap' }}>{quiz.content}</div>
        </div>

        {quiz.image_url && (
          <div>
            <label style={labelStyle}>이미지</label>
            <img src={quiz.image_url} alt="퀴즈 이미지" style={{ display: 'block', maxWidth: '100%', marginTop: '8px', borderRadius: '8px' }} />
          </div>
        )}

        <div>
          <label style={labelStyle}>최대 배팅 포인트</label>
          <div style={valueStyle}>{quiz.max_bet.toLocaleString()} 포인트</div>
        </div>

        <div>
          <label style={labelStyle}>수수료 비율</label>
          <div style={valueStyle}>{quiz.rake_percent}%</div>
        </div>

        <div>
          <label style={labelStyle}>정산 방식</label>
          <div style={valueStyle}>
            {quiz.settlement_type === 'with_answer'
              ? '정답 발표와 동시에 정산'
              : `특정 시간 정산 (${new Date(quiz.settlement_at).toLocaleString('ko-KR')})`
            }
          </div>
        </div>

        <div>
          <label style={labelStyle}>응모 시작일시</label>
          <div style={valueStyle}>{new Date(quiz.start_at).toLocaleString('ko-KR')}</div>
        </div>

        <div>
          <label style={labelStyle}>응모 마감일시</label>
          <div style={valueStyle}>{new Date(quiz.end_at).toLocaleString('ko-KR')}</div>
        </div>

        <div>
          <label style={labelStyle}>정답 공개일시</label>
          <div style={valueStyle}>{new Date(quiz.answer_at).toLocaleString('ko-KR')}</div>
        </div>

        <div>
          <label style={labelStyle}>정답 입력/수정</label>
          <input
            style={inputStyle}
            placeholder="정답을 입력하세요"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            disabled={alreadySettled}
          />
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              onClick={handleSaveAnswer}
              disabled={settling || alreadySettled}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: alreadySettled ? '#ccc' : '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: alreadySettled ? 'not-allowed' : 'pointer',
              }}
            >
              {settling ? '처리 중...' : quiz.settlement_type === 'with_answer' ? '정답 저장 + 정산' : '정답 저장'}
            </button>

            {quiz.settlement_type === 'specific' && quiz.answer && !alreadySettled && (
              <button
                onClick={handleManualSettle}
                disabled={settling}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                지금 정산하기
              </button>
            )}
          </div>
          {alreadySettled && (
            <p style={{ color: '#16a34a', marginTop: '8px', fontSize: '14px' }}>✅ 이미 정산이 완료된 퀴즈예요.</p>
          )}
        </div>

        {message && <p style={{ fontSize: '16px' }}>{message}</p>}

        <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px', display: 'flex', gap: '32px', fontSize: '15px' }}>
          <span>참여자: <strong>{bets.length}명</strong></span>
          <span>정답자: <strong style={{ color: '#16a34a' }}>{correctCount}명</strong></span>
          <span>누적배팅: <strong>{totalBet.toLocaleString()}P</strong></span>
          <span>총당첨: <strong>{totalPayout.toLocaleString()}P</strong></span>
        </div>

        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>참여자 목록</h2>
          {bets.length === 0 ? (
            <p style={{ color: '#999' }}>참여자가 없어요.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>닉네임</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>제출한 답</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>배팅포인트</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>결과</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>당첨포인트</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>보유포인트</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>참여일시</th>
                </tr>
              </thead>
              <tbody>
                {bets.map(bet => (
                  <tr
                    key={bet.id}
                    style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
                    onClick={() => navigate(`/admin/user/${bet.user_id}`)}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <td style={{ padding: '10px 12px' }}>{bet.users?.nickname}</td>
                    <td style={{ padding: '10px 12px' }}>{bet.answer}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>{bet.amount.toLocaleString()}P</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      {bet.is_correct === null
                        ? <span style={{ color: '#999' }}>미정</span>
                        : bet.is_correct
                          ? <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✅ 정답</span>
                          : <span style={{ color: '#dc2626' }}>❌ 오답</span>
                      }
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                      {bet.payout ? `${bet.payout.toLocaleString()}P` : '-'}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                      {bet.users?.points?.toLocaleString()}P
                    </td>
                    <td style={{ padding: '10px 12px', color: '#999', fontSize: '12px' }}>
                      {new Date(bet.created_at).toLocaleString('ko-KR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <button
          onClick={handleDelete}
          style={{
            padding: '14px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '20px',
          }}
        >
          퀴즈 삭제
        </button>

      </div>
    </div>
  )
}

export default AdminQuiz
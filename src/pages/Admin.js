import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

function Admin() {
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuizzes()
  }, [])

  async function fetchQuizzes() {
    setLoading(true)

    const { data: quizData, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('quiz_number', { ascending: false })
    if (error) { setLoading(false); return }

    // 배팅 전체 가져오기
    const { data: betData } = await supabase
      .from('bets')
      .select('quiz_id, amount, is_correct, payout')

    // 퀴즈별 통계 계산
    const quizzesWithStats = quizData.map(q => {
      const qBets = betData?.filter(b => b.quiz_id === q.id) || []
      const totalBet = qBets.reduce((sum, b) => sum + b.amount, 0)
      const correctCount = qBets.filter(b => b.is_correct === true).length
      const totalPayout = qBets.reduce((sum, b) => sum + (b.payout || 0), 0)
      return { ...q, betCount: qBets.length, totalBet, correctCount, totalPayout }
    })

    setQuizzes(quizzesWithStats)
    setLoading(false)
  }

  const filtered = quizzes.filter(q =>
    q.title.includes(search) ||
    q.content.includes(search) ||
    String(q.quiz_number).includes(search)
  )

  const statusLabel = (status) => {
    const map = { scheduled: '예정', open: '진행중', closed: '마감', answered: '정답공개' }
    const colors = { scheduled: '#e5e7eb', open: '#dcfce7', closed: '#fee2e2', answered: '#dbeafe' }
    const textColors = { scheduled: '#555', open: '#16a34a', closed: '#dc2626', answered: '#1d4ed8' }
    return (
      <span style={{
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '13px',
        backgroundColor: colors[status] || '#e5e7eb',
        color: textColors[status] || '#555',
      }}>
        {map[status] || status}
      </span>
    )
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '28px' }}>관리자 페이지</h1>
        <button
          onClick={() => navigate('/admin/new')}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          + 퀴즈 등록
        </button>
      </div>

      <input
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '16px',
          borderRadius: '8px',
          border: '1px solid #ccc',
          boxSizing: 'border-box',
          marginTop: '20px',
          marginBottom: '20px',
        }}
        placeholder="퀴즈 번호, 제목, 본문으로 검색"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading ? (
        <p>불러오는 중...</p>
      ) : filtered.length === 0 ? (
        <p>퀴즈가 없습니다.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>번호</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>제목</th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ccc' }}>상태</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ccc' }}>참여자</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ccc' }}>정답자</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ccc' }}>누적배팅</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ccc' }}>총당첨</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>마감일</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(q => (
              <tr
                key={q.id}
                onClick={() => navigate(`/admin/quiz/${q.id}`)}
                style={{ cursor: 'pointer', borderBottom: '1px solid #eee' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
              >
                <td style={{ padding: '12px' }}>#{q.quiz_number}</td>
                <td style={{ padding: '12px' }}>{q.title}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>{statusLabel(q.status)}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{q.betCount}명</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  {q.correctCount > 0
                    ? <span style={{ color: '#16a34a', fontWeight: 'bold' }}>{q.correctCount}명</span>
                    : <span style={{ color: '#999' }}>0명</span>
                  }
                </td>
<td style={{ padding: '12px', textAlign: 'right' }}>{(q.totalBet || 0).toLocaleString()}P</td>                <td style={{ padding: '12px', textAlign: 'right' }}>
  {(q.totalPayout || 0) > 0 ? `${q.totalPayout.toLocaleString()}P` : '-'}
                </td>
                <td style={{ padding: '12px' }}>{new Date(q.end_at).toLocaleString('ko-KR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Admin
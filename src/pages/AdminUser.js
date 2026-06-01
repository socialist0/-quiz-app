import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabase'

function AdminUser() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [bets, setBets] = useState([])
  const [points, setPoints] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchUser()
  }, [])

  async function fetchUser() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    if (!error) setUser(data)

    // 배팅 목록 + 퀴즈 제목 함께 가져오기
    const { data: betData } = await supabase
      .from('bets')
      .select('*, quizzes(quiz_number, title)')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
    setBets(betData || [])

    setLoading(false)
  }

  async function handleAddPoints() {
    const amount = parseInt(points)
    if (!amount) return
    const { error } = await supabase
      .from('users')
      .update({ points: user.points + amount })
      .eq('id', id)
    if (!error) {
      setMessage(`✅ ${amount.toLocaleString()}P 지급 완료!`)
      setPoints('')
      fetchUser()
    } else {
      setMessage('❌ 오류: ' + error.message)
    }
  }

  async function handleSubtractPoints() {
    const amount = parseInt(points)
    if (!amount) return
    const { error } = await supabase
      .from('users')
      .update({ points: user.points - amount })
      .eq('id', id)
    if (!error) {
      setMessage(`✅ ${amount.toLocaleString()}P 차감 완료!`)
      setPoints('')
      fetchUser()
    } else {
      setMessage('❌ 오류: ' + error.message)
    }
  }

  async function handleDelete() {
    if (!window.confirm('정말 이 회원을 삭제하시겠습니까?')) return
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
    if (!error) navigate('/admin/users')
    else setMessage('❌ 오류: ' + error.message)
  }

  if (loading) return <p>불러오는 중...</p>
  if (!user) return <p>회원을 찾을 수 없습니다.</p>

  const inputStyle = {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    width: '200px',
  }

  const buttonStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  }

  const totalBet = bets.reduce((sum, b) => sum + b.amount, 0)
  const totalPayout = bets.reduce((sum, b) => sum + (b.payout || 0), 0)

  return (
    <div>
      {/* 상단 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px' }}>회원 상세</h1>
        <button onClick={() => navigate('/admin/users')} style={{ ...buttonStyle, backgroundColor: '#e5e7eb' }}>
          목록으로
        </button>
      </div>

      {/* 회원 정보 */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '16px' }}>
          <div><strong>닉네임:</strong> {user.nickname}</div>
          <div><strong>이메일:</strong> {user.email}</div>
          <div><strong>보유 포인트:</strong> {user.points.toLocaleString()} P</div>
          <div><strong>상태:</strong>{' '}
            <span style={{
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '13px',
              backgroundColor: user.status === 'active' ? '#dcfce7' : '#fee2e2',
              color: user.status === 'active' ? '#16a34a' : '#dc2626',
            }}>
              {user.status === 'active' ? '정상' : '탈퇴신청'}
            </span>
          </div>
          <div><strong>가입일:</strong> {new Date(user.created_at).toLocaleString('ko-KR')}</div>
          {user.deleted_at && (
            <div><strong>탈퇴신청일:</strong> {new Date(user.deleted_at).toLocaleString('ko-KR')}</div>
          )}
        </div>
      </div>

      {/* 포인트 지급/차감 */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>포인트 지급/차감</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            style={inputStyle}
            type="number"
            placeholder="포인트 입력"
            value={points}
            onChange={e => setPoints(e.target.value)}
          />
          <button onClick={handleAddPoints} style={{ ...buttonStyle, backgroundColor: '#4f46e5', color: 'white' }}>
            지급
          </button>
          <button onClick={handleSubtractPoints} style={{ ...buttonStyle, backgroundColor: '#f59e0b', color: 'white' }}>
            차감
          </button>
        </div>
        {message && <p style={{ marginTop: '12px', fontSize: '16px' }}>{message}</p>}
      </div>

      {/* 배팅 내역 */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>퀴즈 참여 내역</h2>

        {/* 요약 */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '20px', fontSize: '14px', color: '#555' }}>
          <span>총 참여: <strong>{bets.length}건</strong></span>
          <span>총 배팅: <strong>{totalBet.toLocaleString()}P</strong></span>
          <span>총 당첨: <strong>{totalPayout.toLocaleString()}P</strong></span>
        </div>

        {bets.length === 0 ? (
          <p style={{ color: '#999' }}>참여한 퀴즈가 없어요.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ padding: '10px 8px' }}>퀴즈</th>
                <th style={{ padding: '10px 8px' }}>답변</th>
                <th style={{ padding: '10px 8px', textAlign: 'right' }}>배팅</th>
                <th style={{ padding: '10px 8px', textAlign: 'center' }}>결과</th>
                <th style={{ padding: '10px 8px', textAlign: 'right' }}>당첨 포인트</th>
                <th style={{ padding: '10px 8px' }}>참여일</th>
              </tr>
            </thead>
            <tbody>
              {bets.map(bet => (
                <tr key={bet.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 8px' }}>
                    <span style={{ color: '#999', fontSize: '12px' }}>#{bet.quizzes?.quiz_number} </span>
                    {bet.quizzes?.title}
                  </td>
                  <td style={{ padding: '10px 8px' }}>{bet.answer}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right' }}>{bet.amount.toLocaleString()}P</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    {bet.is_correct === null ? (
                      <span style={{ color: '#999' }}>미정</span>
                    ) : bet.is_correct ? (
                      <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✅ 정답</span>
                    ) : (
                      <span style={{ color: '#dc2626' }}>❌ 오답</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                    {bet.payout ? `${bet.payout.toLocaleString()}P` : '-'}
                  </td>
                  <td style={{ padding: '10px 8px', color: '#999', fontSize: '12px' }}>
                    {new Date(bet.created_at).toLocaleString('ko-KR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 회원 삭제 */}
      <button
        onClick={handleDelete}
        style={{ ...buttonStyle, backgroundColor: '#ef4444', color: 'white', padding: '14px 28px' }}
      >
        회원 삭제
      </button>
    </div>
  )
}

export default AdminUser
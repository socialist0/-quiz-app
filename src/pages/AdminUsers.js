import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

function AdminUsers() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)

    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) { setLoading(false); return }

    // 배팅 내역 전체 가져오기
    const { data: betData } = await supabase
      .from('bets')
      .select('user_id, is_correct')

    // 유저별 참여 수 / 정답 수 계산
    const usersWithStats = userData.map(u => {
      const userBets = betData?.filter(b => b.user_id === u.id) || []
      const correctCount = userBets.filter(b => b.is_correct === true).length
      return { ...u, betCount: userBets.length, correctCount }
    })

    setUsers(usersWithStats)
    setLoading(false)
  }

  const filtered = users.filter(u =>
    u.nickname.includes(search)
  )

  return (
    <div>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>회원 관리</h1>

      <input
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '16px',
          borderRadius: '8px',
          border: '1px solid #ccc',
          boxSizing: 'border-box',
          marginBottom: '20px',
        }}
        placeholder="닉네임으로 검색"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading ? (
        <p>불러오는 중...</p>
      ) : filtered.length === 0 ? (
        <p>회원이 없습니다.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '16px', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>닉네임</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ccc' }}>보유 포인트</th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ccc' }}>참여 퀴즈</th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ccc' }}>정답</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>상태</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>가입일</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr
                key={u.id}
                onClick={() => navigate(`/admin/user/${u.id}`)}
                style={{ cursor: 'pointer', borderBottom: '1px solid #eee' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
              >
                <td style={{ padding: '12px' }}>{u.nickname}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{u.points.toLocaleString()} P</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>{u.betCount}건</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  {u.correctCount > 0
                    ? <span style={{ color: '#16a34a', fontWeight: 'bold' }}>{u.correctCount}건</span>
                    : <span style={{ color: '#999' }}>0건</span>
                  }
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    backgroundColor: u.status === 'active' ? '#dcfce7' : '#fee2e2',
                    color: u.status === 'active' ? '#16a34a' : '#dc2626',
                  }}>
                    {u.status === 'active' ? '정상' : '탈퇴신청'}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>{new Date(u.created_at).toLocaleString('ko-KR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default AdminUsers
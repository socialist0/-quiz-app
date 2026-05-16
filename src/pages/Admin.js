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
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('quiz_number', { ascending: false })
    if (!error) setQuizzes(data)
    setLoading(false)
  }

  const filtered = quizzes.filter(q =>
    q.title.includes(search) ||
    q.content.includes(search) ||
    String(q.quiz_number).includes(search)
  )

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
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
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '16px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>번호</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>제목</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>상태</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>응모 마감</th>
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
                <td style={{ padding: '12px' }}>{q.status}</td>
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
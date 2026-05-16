import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabase'

function AdminQuiz() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchQuiz()
  }, [])

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
    setLoading(false)
  }

  async function handleSaveAnswer() {
    const { error } = await supabase
      .from('quizzes')
      .update({ answer })
      .eq('id', id)
    if (!error) setMessage('✅ 정답이 저장되었습니다!')
    else setMessage('❌ 오류: ' + error.message)
  }

  async function handleDelete() {
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    const { error } = await supabase.from('quizzes').delete().eq('id', id)
    if (!error) navigate('/admin')
    else setMessage('❌ 오류: ' + error.message)
  }

  if (loading) return <p>불러오는 중...</p>
  if (!quiz) return <p>퀴즈를 찾을 수 없습니다.</p>

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

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '28px' }}>퀴즈 #{quiz.quiz_number}</h1>
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
          />
          <button
            onClick={handleSaveAnswer}
            style={{
              marginTop: '10px',
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
            정답 저장
          </button>
        </div>

        {message && <p style={{ fontSize: '16px' }}>{message}</p>}

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
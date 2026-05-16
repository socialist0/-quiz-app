import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

function AdminNew() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [maxBet, setMaxBet] = useState('')
  const [rakePercent, setRakePercent] = useState(10)
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [answerAt, setAnswerAt] = useState('')
  const [answer, setAnswer] = useState('')
  const [image, setImage] = useState(null)
  const [settlementType, setSettlementType] = useState('with_answer')
  const [settlementAt, setSettlementAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

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

  const labelStyle = {
    fontSize: '15px',
    fontWeight: 'bold',
  }

  async function handleSubmit() {
    setLoading(true)
    setMessage('')

    try {
      let image_url = null

      if (image) {
        const fileName = `${Date.now()}-${image.name}`
        const { error: uploadError } = await supabase.storage
          .from('quiz-images')
          .upload(fileName, image)
        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('quiz-images')
          .getPublicUrl(fileName)
        image_url = urlData.publicUrl
      }

      const { error } = await supabase.from('quizzes').insert({
        title,
        content,
        max_bet: parseInt(maxBet),
        rake_percent: parseInt(rakePercent),
        start_at: startAt,
        end_at: endAt,
        answer_at: answerAt,
        answer: answer || null,
        image_url,
        settlement_type: settlementType,
        settlement_at: settlementType === 'specific' ? settlementAt : null,
      })

      if (error) throw error
      navigate('/admin')
    } catch (err) {
      setMessage('❌ 오류: ' + err.message)
    }

    setLoading(false)
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px' }}>관리자 페이지</h1>
      <h2 style={{ fontSize: '22px' }}>퀴즈 등록</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <div>
          <label style={labelStyle}>퀴즈 제목</label>
          <input
            style={inputStyle}
            placeholder="퀴즈 제목을 입력하세요"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>퀴즈 본문</label>
          <textarea
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="퀴즈 본문을 입력하세요"
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={6}
          />
        </div>

        <div>
          <label style={labelStyle}>이미지 업로드</label>
          <input
            style={{ ...inputStyle, padding: '8px' }}
            type="file"
            accept="image/*"
            onChange={e => setImage(e.target.files[0])}
          />
        </div>

        <div>
          <label style={labelStyle}>정답 (선택사항 - 나중에 입력 가능)</label>
          <input
            style={inputStyle}
            placeholder="정답을 입력하세요"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>최대 배팅 포인트</label>
          <input
            style={inputStyle}
            type="number"
            placeholder="최대 배팅 포인트를 입력하세요"
            value={maxBet}
            onChange={e => setMaxBet(e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>수수료 비율 (%)</label>
          <input
            style={inputStyle}
            type="number"
            placeholder="수수료 비율을 입력하세요"
            value={rakePercent}
            onChange={e => setRakePercent(e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>응모 시작일시</label>
          <input
            style={inputStyle}
            type="datetime-local"
            value={startAt}
            onChange={e => setStartAt(e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>응모 마감일시</label>
          <input
            style={inputStyle}
            type="datetime-local"
            value={endAt}
            onChange={e => setEndAt(e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>정답 공개일시</label>
          <input
            style={inputStyle}
            type="datetime-local"
            value={answerAt}
            onChange={e => setAnswerAt(e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>포인트 정산 시기</label>
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                value="with_answer"
                checked={settlementType === 'with_answer'}
                onChange={e => setSettlementType(e.target.value)}
              />
              정답 발표와 동시에 정산
            </label>
            <label style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                value="specific"
                checked={settlementType === 'specific'}
                onChange={e => setSettlementType(e.target.value)}
              />
              특정 날짜/시간에 정산
            </label>
          </div>
          {settlementType === 'specific' && (
            <input
              style={{ ...inputStyle, marginTop: '10px' }}
              type="datetime-local"
              value={settlementAt}
              onChange={e => setSettlementAt(e.target.value)}
            />
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/admin')}
            style={{
              padding: '16px',
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: '#ccc',
              color: 'black',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              flex: 1,
            }}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '16px',
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              flex: 2,
            }}
          >
            {loading ? '등록 중...' : '퀴즈 등록'}
          </button>
        </div>

        {message && <p style={{ fontSize: '18px' }}>{message}</p>}
      </div>
    </div>
  )
}

export default AdminNew
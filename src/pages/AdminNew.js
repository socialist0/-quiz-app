import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

function AdminNew() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [quizType, setQuizType] = useState('day')
  const [maxBet, setMaxBet] = useState('')
  const [rakePercent, setRakePercent] = useState(10)
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [answerAt, setAnswerAt] = useState('')
  const [answer, setAnswer] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [settlementType, setSettlementType] = useState('with_answer')
  const [settlementAt, setSettlementAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const fileInputRef = useRef(null)

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

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleImageRemove = () => {
    setImage(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
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
        quiz_type: quizType,
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

  const typeOptions = [
    { value: 'hour', label: 'H - Hour' },
    { value: 'day', label: 'D - Day' },
    { value: 'week', label: 'W - Week' },
    { value: 'month', label: 'M - Month' },
  ]

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
          <label style={labelStyle}>퀴즈 유형</label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            {typeOptions.map(opt => (
              <label
                key={opt.value}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px',
                  borderRadius: '8px',
                  border: `2px solid ${quizType === opt.value ? '#4f46e5' : '#e5e7eb'}`,
                  backgroundColor: quizType === opt.value ? '#eef2ff' : 'white',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: quizType === opt.value ? 'bold' : 'normal',
                  color: quizType === opt.value ? '#4f46e5' : '#555',
                  transition: 'all 0.15s',
                }}
              >
                <input
                  type="radio"
                  value={opt.value}
                  checked={quizType === opt.value}
                  onChange={e => setQuizType(e.target.value)}
                  style={{ display: 'none' }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>이미지 업로드</label>

          {imagePreview ? (
            <div style={{ marginTop: '10px' }}>
              <img
                src={imagePreview}
                alt="미리보기"
                style={{
                  width: '100%',
                  maxHeight: '300px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  backgroundColor: '#f9f9f9',
                }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  🔄 이미지 교체
                </button>
                <button
                  type="button"
                  onClick={handleImageRemove}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  🗑️ 이미지 삭제
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: 'block',
                width: '100%',
                marginTop: '6px',
                padding: '32px',
                fontSize: '15px',
                color: '#888',
                backgroundColor: '#f9f9f9',
                border: '2px dashed #ccc',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              📷 클릭하여 이미지 선택
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
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
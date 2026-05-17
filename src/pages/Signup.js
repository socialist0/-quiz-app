import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

function Signup() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
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

  async function handleSignup() {
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error

      const { error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        nickname,
        email,
      })
      if (profileError) throw profileError

      setMessage('✅ 회원가입 완료!')
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      setMessage('❌ 오류: ' + err.message)
    }

    setLoading(false)
  }

  return (
    <div style={{ padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px' }}>회원가입</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
        <div>
          <label style={labelStyle}>닉네임</label>
          <input
            style={inputStyle}
            placeholder="닉네임을 입력하세요"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>이메일</label>
          <input
            style={inputStyle}
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>비밀번호</label>
          <input
            style={inputStyle}
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <button
          onClick={handleSignup}
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
          }}
        >
          {loading ? '가입 중...' : '회원가입'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '15px' }}>
          이미 계정이 있으신가요?{' '}
          <span
            onClick={() => navigate('/login')}
            style={{ color: '#4f46e5', cursor: 'pointer', fontWeight: 'bold' }}
          >
            로그인
          </span>
        </p>

        {message && <p style={{ fontSize: '16px' }}>{message}</p>}
      </div>
    </div>
  )
}

export default Signup
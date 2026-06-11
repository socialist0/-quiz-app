import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabase'

function MyPage() {
     const navigate = useNavigate()
     const [user, setUser] = useState(null)
     const [bets, setBets] = useState([])
     const [loading, setLoading] = useState(true)

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

               const { data: betData } = await supabase
                    .from('bets')
                    .select('*, quizzes(*)')
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: false })
               setBets(betData || [])

               setLoading(false)
          }
          init()
     }, [navigate])

     const handleLogout = async () => {
          await supabase.auth.signOut()
          navigate('/login')
     }

     if (loading) return null

     const activeBets = bets.filter(b => b.quizzes?.status === 'open' && !b.quizzes?.is_hidden)
     const pendingBets = bets.filter(b => ['closed', 'scheduled'].includes(b.quizzes?.status) && !b.quizzes?.is_hidden)
     const settledBets = bets.filter(b => b.quizzes?.status === 'answered' && !b.quizzes?.is_hidden)

     const formatDate = (d) => new Date(d).toLocaleDateString('ko-KR', {
          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
     })

     const BetCard = ({ bet }) => {
          const quiz = bet.quizzes
          const isOpen = quiz?.status === 'open'
          const isAnswered = quiz?.status === 'answered'
          // is_correct가 null이 아닐 때만 정산 완료
          const isSettled = bet.is_correct !== null && bet.is_correct !== undefined

          return (
               <div
                    onClick={() => navigate(`/quiz/${quiz?.id}`)}
                    style={{
                         border: '1px solid #e5e7eb',
                         borderRadius: '10px',
                         padding: '16px',
                         marginBottom: '10px',
                         cursor: 'pointer',
                         backgroundColor: 'white',
                         transition: 'box-shadow 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
               >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                         <div style={{ flex: 1 }}>
                              <p style={{ margin: '0 0 4px', fontWeight: 'bold', fontSize: '15px', color: '#111' }}>
                                   {quiz?.title}
                              </p>
                              <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#999' }}>
                                   참여: {formatDate(bet.created_at)}
                              </p>
                              <div style={{ display: 'flex', gap: '16px', fontSize: '14px', alignItems: 'center' }}>
                                   <span style={{ color: '#555' }}>
                                        배팅 <strong style={{ color: '#111' }}>{bet.amount?.toLocaleString()}P</strong>
                                   </span>
                                   {isAnswered && (
                                        isSettled ? (
                                             <span style={{ color: bet.is_correct ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
                                                  {bet.is_correct
                                                       ? `🎉 +${bet.payout?.toLocaleString()}P`
                                                       : '😢 낙첨'}
                                             </span>
                                        ) : (
                                             <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                                                  ⏳ 정산 대기 중
                                             </span>
                                        )
                                   )}
                              </div>
                              {isOpen && (
                                   <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#4f46e5' }}>
                                        ✏️ 수정 가능
                                   </p>
                              )}
                         </div>
                         <span style={{ fontSize: '18px', color: '#ccc', marginLeft: '8px' }}>›</span>
                    </div>
               </div>
          )
     }

     const Section = ({ title, icon, bets, emptyText }) => (
          <div style={{ marginBottom: '32px' }}>
               <h3 style={{ fontSize: '17px', margin: '0 0 12px', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {icon} {title}
                    <span style={{
                         fontSize: '13px',
                         fontWeight: 'normal',
                         color: '#888',
                         backgroundColor: '#f3f4f6',
                         padding: '2px 8px',
                         borderRadius: '20px',
                         marginLeft: '4px',
                    }}>
                         {bets.length}
                    </span>
               </h3>
               {bets.length === 0 ? (
                    <p style={{ color: '#aaa', fontSize: '14px', padding: '16px 0' }}>{emptyText}</p>
               ) : (
                    bets.map(bet => <BetCard key={bet.id} bet={bet} />)
               )}
          </div>
     )

     // 정산 완료된 것만 수익 계산 (is_correct가 null이 아닌 것)
     const realSettledBets = settledBets.filter(b => b.is_correct !== null && b.is_correct !== undefined)
     const totalBet = realSettledBets.reduce((sum, b) => sum + b.amount, 0)
     const totalPayout = realSettledBets.reduce((sum, b) => sum + (b.payout || 0), 0)
     const totalProfit = totalPayout - totalBet

     return (
          <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <Link to="/" style={{ fontSize: '14px', color: '#4f46e5', textDecoration: 'none' }}>
                         ← 홈으로
                    </Link>
                    <button
                         onClick={handleLogout}
                         style={{
                              padding: '8px 16px',
                              fontSize: '14px',
                              cursor: 'pointer',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              backgroundColor: 'white',
                         }}
                    >
                         로그아웃
                    </button>
               </div>

               <div style={{
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    borderRadius: '12px',
                    padding: '24px',
                    color: 'white',
                    marginBottom: '32px',
               }}>
                    <p style={{ margin: '0 0 4px', fontSize: '13px', opacity: 0.8 }}>안녕하세요 👋</p>
                    <h2 style={{ margin: '0 0 16px', fontSize: '22px' }}>{user?.nickname}</h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                         <div>
                              <p style={{ margin: '0 0 2px', fontSize: '13px', opacity: 0.8 }}>보유 포인트</p>
                              <p style={{ margin: 0, fontSize: '26px', fontWeight: 'bold' }}>
                                   {user?.points?.toLocaleString()}P
                              </p>
                         </div>
                         {realSettledBets.length > 0 && (
                              <div style={{ textAlign: 'right' }}>
                                   <p style={{ margin: '0 0 2px', fontSize: '12px', opacity: 0.8 }}>총 수익</p>
                                   <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: totalProfit >= 0 ? '#86efac' : '#fca5a5' }}>
                                        {totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString()}P
                                   </p>
                              </div>
                         )}
                    </div>
               </div>

               <Section
                    title="진행 중인 퀴즈"
                    icon="📋"
                    bets={activeBets}
                    emptyText="참여 중인 퀴즈가 없어요."
               />
               <Section
                    title="발표 대기 중"
                    icon="⏳"
                    bets={pendingBets}
                    emptyText="대기 중인 퀴즈가 없어요."
               />
               <Section
                    title="정산 완료"
                    icon="✅"
                    bets={settledBets}
                    emptyText="정산된 퀴즈가 없어요."
               />
          </div>
     )
}

export default MyPage
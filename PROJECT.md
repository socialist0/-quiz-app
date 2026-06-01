# 퀴즈 배팅 앱 프로젝트

## 프로젝트 개요
관리자가 퀴즈를 만들고 포인트를 지급하면, 유저가 포인트를 배팅해서 정답을 맞추는 웹앱.
정답자끼리 전체 배팅 포인트에서 수수료를 제외한 금액을 균등 분배.

## 기술 스택
- Frontend: React (create-react-app)
- Database: Supabase (PostgreSQL)
- Auth: Supabase Auth (이메일/비밀번호)
- 배포 예정: Vercel + Supabase

## 로컬 개발 환경
- 맥북 M5
- Node.js v26.0.0
- 프로젝트 경로: ~/Documents/projects/quiz-app
- 실행: cd ~/Documents/projects/quiz-app && npm start
- 브라우저: localhost:3000

## 페이지 구조
- / → 유저 홈 (완성)
- /quiz/:id → 퀴즈 참여 (완성)
- /signup → 회원가입
- /login → 로그인
- /admin → 관리자 (AdminLayout 사이드바 포함)
- /admin/quizzes → 퀴즈 목록 + 검색
- /admin/new → 퀴즈 등록
- /admin/quiz/:id → 퀴즈 상세 (정답 입력, 정산, 삭제)
- /admin/users → 회원 목록
- /admin/user/:id → 회원 상세 (포인트 지급/차감, 삭제)

## 파일 구조
src/
  pages/
    Home.js → 유저 홈 (완성)
    Quiz.js → 퀴즈 참여 (완성)
    Signup.js → 회원가입 (완성)
    Login.js → 로그인 (완성)
    AdminLayout.js → 관리자 공통 레이아웃 사이드바 (완성)
    Admin.js → 관리자 퀴즈 목록 (완성) - 참여자수/정답자수/누적배팅/총당첨 표시
    AdminNew.js → 퀴즈 등록 (완성)
    AdminQuiz.js → 퀴즈 상세 (완성) - 정답 입력/정산/참여자 목록
    AdminUsers.js → 회원 목록 (완성) - 참여 퀴즈수/정답수 표시
    AdminUser.js → 회원 상세 (완성) - 배팅 내역/결과 표시
  supabase.js → Supabase 클라이언트
  App.js → 라우팅

## Supabase
- .env 파일에 키 저장 (gitignore 처리됨)
- Storage 버킷: quiz-images (퀴즈 이미지 저장)

## 데이터베이스 테이블

### quizzes
- id (UUID)
- quiz_number (SERIAL) → 검색용 고유번호
- title (TEXT) → 퀴즈 제목
- content (TEXT) → 퀴즈 본문
- image_url (TEXT) → 이미지 (Supabase Storage: quiz-images)
- max_bet (INTEGER) → 최대 배팅 포인트
- rake_percent (INTEGER) → 수수료 비율 (기본 10%)
- start_at (TIMESTAMP) → 응모 시작일시
- end_at (TIMESTAMP) → 응모 마감일시
- answer_at (TIMESTAMP) → 정답 공개일시
- answer (TEXT) → 정답 (나중에 입력 가능)
- status (TEXT) → scheduled/open/closed/answered
- settlement_type (TEXT) → with_answer/specific
- settlement_at (TIMESTAMP) → 특정 정산일시
- created_at (TIMESTAMP)

### users
- id (UUID) → Supabase Auth와 연동
- nickname (TEXT UNIQUE)
- email (TEXT)
- points (INTEGER) → 보유 포인트
- status (TEXT) → active/pending_delete
- deleted_at (TIMESTAMP) → 탈퇴 신청 일시
- created_at (TIMESTAMP)

### bets
- id (UUID)
- quiz_id (UUID) → quizzes 참조
- user_id (UUID) → users 참조
- amount (INTEGER) → 배팅 포인트
- answer (TEXT) → 유저 답변
- is_correct (BOOLEAN) → 정답 여부 (기본값 NULL, 정산 후 업데이트)
- payout (INTEGER) → 받은 배당 포인트
- created_at (TIMESTAMP)

## Supabase RLS 정책
- quizzes, bets, users 테이블 전체 허용 정책 추가됨
- storage.objects 전체 허용 정책 추가됨 (이미지 업로드)

## pg_cron 자동화 (1분마다 실행)
크론 이름: update-quiz-status
- quizzes status 자동 변경
  - scheduled → open: start_at 도달 시
  - open → closed: end_at 도달 시
  - closed → answered: answer_at 도달 시 + answer 입력된 경우
- specific 타입 자동 정산: settlement_at 도달 시 정답 비교 → is_correct/payout 업데이트 → 유저 포인트 지급
- 시간 기준: UTC + 9시간 (한국 시간)

## 정산 로직
- 전체 배팅 포인트 합산
- 수수료(rake_percent) 제외 → 상금풀 계산
- 정답자 답변 비교: trim() 처리 후 비교
- 정답자끼리 상금풀 균등 분배 (floor 처리)
- bets 테이블: is_correct, payout 업데이트
- users 테이블: points 증가
- with_answer 타입: 관리자가 정답 저장 시 즉시 정산
- specific 타입: pg_cron 자동 정산 또는 관리자 수동 정산 버튼

## 완성된 기능
- [x] Supabase 연결
- [x] 회원가입 (이메일/비밀번호/닉네임)
- [x] 로그인
- [x] 관리자 레이아웃 (사이드바)
- [x] 퀴즈 등록 (제목, 본문, 이미지, 배팅한도, 수수료, 날짜, 정산시기)
- [x] 퀴즈 목록 + 검색 (번호/제목/본문) + 통계 (참여자수/정답자수/누적배팅/총당첨)
- [x] 퀴즈 상세 보기 + 정답 입력/수정 + 정산 + 삭제
- [x] 퀴즈 참여자 목록 (닉네임/제출한 답/배팅포인트/결과/당첨포인트/보유포인트)
- [x] 회원 목록 (참여 퀴즈수/정답수 표시)
- [x] 회원 상세 (포인트 지급/차감, 배팅 내역, 삭제)
- [x] 유저 홈 (로그인 확인, 퀴즈 목록, 포인트 표시, 로그아웃)
- [x] 퀴즈 참여 (배팅 + 주관식 답변, 중복 참여 방지)
- [x] 퀴즈 status 자동 변경 (pg_cron)
- [x] 정산 로직 (with_answer 즉시 / specific 자동+수동)

## 미완성 기능 (다음 단계)
- [ ] 관리자 - 회원 삭제시 Supabase Auth도 자동 삭제 (Edge Function)
- [ ] 유저 - 마이페이지 (포인트, 참여 퀴즈 목록, 결과)
- [ ] 유저 - 탈퇴 신청
- [ ] 배포 (Vercel)

## 주의사항
- 관리자 회원 삭제시 users 테이블 삭제 후 Supabase Auth에서도 수동 삭제 필요
- Auth 유저 삭제 순서: users 테이블 먼저 삭제 → Auth 삭제
- 만약 순서가 바뀌었으면 SQL Editor에서 수동 삭제
- bets.is_correct 기본값은 NULL (false 아님) → 정산 전/후 구분용
- pg_cron 시간은 UTC 기준이므로 쿼리에서 +9시간 처리 필요
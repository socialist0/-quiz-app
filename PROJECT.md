# 퀴즈 배팅 앱 프로젝트

## 프로젝트 개요
관리자가 퀴즈를 만들고 포인트를 지급하면, 유저가 포인트를 배팅해서 정답을 맞추는 웹앱.
정답자끼리 전체 배팅 포인트에서 수수료를 제외한 금액을 균등 분배.

## 기술 스택
- Frontend: React (create-react-app)
- Database: Supabase (PostgreSQL)
- 배포 예정: Vercel + Supabase

## 로컬 개발 환경
- 맥북 M5
- Node.js v26.0.0
- 프로젝트 경로: ~/Documents/projects/quiz-app
- 실행: cd ~/Documents/projects/quiz-app && npm start
- 브라우저: localhost:3000

## 페이지 구조
- / → 유저 홈 (닉네임 입력 + 퀴즈 목록)
- /quiz/:id → 퀴즈 참여 (포인트 배팅 + 주관식 답변)
- /admin → 관리자 퀴즈 목록 + 검색
- /admin/new → 퀴즈 등록
- /admin/quiz/:id → 퀴즈 상세 (정답 입력, 삭제)

## 파일 구조
src/
  pages/
    Home.js → 유저 홈 (미완성)
    Quiz.js → 퀴즈 참여 (미완성)
    Admin.js → 관리자 퀴즈 목록 (완성)
    AdminNew.js → 퀴즈 등록 (완성)
    AdminQuiz.js → 퀴즈 상세 (완성)
  supabase.js → Supabase 클라이언트
  App.js → 라우팅

## Supabase
- .env 파일에 키 저장 (gitignore 처리됨)

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
- id (UUID)
- nickname (TEXT UNIQUE) → 로그인 없이 닉네임만 사용
- points (INTEGER) → 보유 포인트
- created_at (TIMESTAMP)

### bets
- id (UUID)
- quiz_id (UUID) → quizzes 참조
- user_id (UUID) → users 참조
- amount (INTEGER) → 배팅 포인트
- answer (TEXT) → 유저 답변
- is_correct (BOOLEAN) → 정답 여부
- created_at (TIMESTAMP)

## 완성된 기능
- [x] Supabase 연결
- [x] 퀴즈 등록 (제목, 본문, 이미지, 배팅한도, 수수료, 날짜, 정산시기)
- [x] 퀴즈 목록 + 검색 (번호/제목/본문)
- [x] 퀴즈 상세 보기
- [x] 정답 입력/수정
- [x] 퀴즈 삭제

## 미완성 기능 (다음 단계)
- [ ] 관리자 - 유저 관리 (생성, 포인트 지급/차감)
- [ ] 유저 홈 페이지 (닉네임 입력, 퀴즈 목록)
- [ ] 퀴즈 참여 페이지 (배팅 + 답변)
- [ ] 정산 로직 (정답자 포인트 분배)
- [ ] GitHub Pages 또는 Vercel 배포
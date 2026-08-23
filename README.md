# Exercise Timer

운동 타이머와 외부 PostgreSQL DB 기반 식단 기록 프로그램입니다.

## 실행

```powershell
npm install
node server.js
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

## 외부 DB 연결

서버 시작 전에 PostgreSQL 연결 문자열을 환경변수로 등록합니다. Render에서는 **Environment > Environment Variables**에 다음을 추가합니다.

```text
DATABASE_URL=postgresql://사용자:비밀번호@호스트:5432/데이터베이스
NODE_ENV=production
```

Render의 PostgreSQL을 사용한다면 제공되는 Internal Database URL 또는 External Database URL을 `DATABASE_URL` 값으로 넣으면 됩니다. 서버가 처음 `/api/meals`를 받을 때 `meals` 테이블을 자동으로 생성합니다.

식단 화면에서는 오늘 날짜의 식단 조회, 추가, 삭제와 총칼로리 계산을 제공합니다.
운동할 때 쓸 수 있는 타이머입니다.
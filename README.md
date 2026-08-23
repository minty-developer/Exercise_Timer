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
DATABASE_URL=postgresql://postgres.xxxxx:비밀번호@aws-0-지역.pooler.supabase.com:5432/postgres
NODE_ENV=production
```

Supabase Dashboard의 **Connect > Session pooler**에서 URI를 복사해 `DATABASE_URL`에 넣으세요. Render에서는 Supabase의 Direct connection 주소(`db.프로젝트ID.supabase.co:5432`) 대신 Session pooler 주소(`*.pooler.supabase.com:5432`)를 사용해야 IPv6 `ENETUNREACH` 오류를 피할 수 있습니다. URI 안의 비밀번호에 `@`, `#`, `/`, `:` 같은 문자가 있으면 URL 인코딩해야 합니다.

서버는 IPv4를 우선 사용하고 10초 안에 연결되지 않으면 오류를 반환합니다. 서버가 처음 `/api/meals`를 받을 때 `meals` 테이블을 자동으로 생성합니다.

식단 화면에서는 오늘 날짜의 식단 조회, 추가, 삭제와 총칼로리 계산을 제공합니다.
운동할 때 쓸 수 있는 타이머입니다.
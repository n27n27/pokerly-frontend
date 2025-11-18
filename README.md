# Pokerly Frontend

- Vue 3 + Quasar
- Axios
- Build: Vite

## Dev

1. `npm install`
2. `quasar dev`
3. `.env.development`:
   - `VITE_API_BASE_URL=http://localhost:8080/api`
   - `VITE_API_TIMEOUT=10000`

## Build

1. `quasar build`
2. 결과물: `dist/spa/`

## Production (EC2)

프런트는 정적 파일만 업로드하면 반영됨.

### 배포 절차

1. 기존 파일 삭제
   - `ssh ubuntu@pokerly.kr "rm -rf /srv/pokerly/frontend/*"`
2. 새 빌드 업로드
   - `scp -r dist/spa/* ubuntu@pokerly.kr:/srv/pokerly/frontend/`

## Nginx (요약)

- `root /srv/pokerly/frontend;`
- SPA 라우팅: `try_files $uri $uri/ /index.html;`
- API 프록시: `/api → http://127.0.0.1:9000`

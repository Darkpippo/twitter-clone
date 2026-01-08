# Backend (NestJS)

## Run
```bash
npm run start:dev
```
## .env
```bash
JWT_SECRET=super-secret-key-unknown
NEXT_PUBLIC_API_BASE_URL=3000
```

## Endpoints I Use
POST /auth/register

POST /auth/login

GET /tweets (feed)

POST /tweets

POST/DEL /tweets/:id/like

POST /tweets/:id/comment

POST /:id/retweet

GET /users/:id (profile)

POST/DEL /users/:id/follow

GET /users/follow (my follows)

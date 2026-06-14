# Backend scaffold for Decode app

This workspace contains scaffolded backend services:

- `node-services/auth` — Express Auth service (register/login/refresh/logout, Google stub)
- `node-services/user` — Express User service using Prisma (PostgreSQL)
- `node-services/notification` — Express Notification service (FCM stub)
- `python/decode` — FastAPI Decode service with Socket.IO stream endpoint
- `python/internal` — FastAPI AI pipeline stubs: features, conformer, rescore, tts

Each service has its own `package.json` or `requirements.txt`. Configure environment variables as shown in `.env.example`.

Quick start (Node services):

1. Install dependencies for each Node service and generate Prisma client for `user`:

```
cd backend/node-services/user
npm install
npx prisma generate
cd ../auth && npm install
cd ../notification && npm install
```

2. Run services (each in its own terminal):

```
cd backend/node-services/user
npm run dev

cd backend/node-services/auth
npm run dev

cd backend/node-services/notification
npm run dev
```

Python services:

```
cd backend/python/internal
pip install -r requirements.txt
uvicorn internal_features:app --port 8001
uvicorn internal_conformer:app --port 8002
uvicorn internal_rescore:app --port 8003
uvicorn internal_tts:app --port 8004

cd ../decode
pip install -r requirements.txt
uvicorn main:app --port 8010
```

Environment variables for local testing are in `.env.example`.

This scaffold provides functioning endpoints and a Socket.IO stream flow that calls the internal stub services. Replace the stubs with real ML services when ready.

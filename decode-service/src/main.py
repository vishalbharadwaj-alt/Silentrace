from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import os
import asyncio
import aioredis

app = FastAPI()

REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379')

@app.on_event('startup')
async def startup():
    app.state.redis = await aioredis.from_url(REDIS_URL)

@app.websocket('/api/decode/stream')
async def decode_stream(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            data = await ws.receive_json()
            # Expecting { audio: base64_chunk } or control messages
            if data.get('ping'):
                await ws.send_json({'pong': True})
                continue
            # For demo: echo back partial words
            if 'audio' in data:
                await ws.send_json({'partial': 'hello'})
            if data.get('final'):
                await ws.send_json({'final': 'hello world'})
    except WebSocketDisconnect:
        return

@app.post('/api/enrolment/samples')
async def enrolment_samples(payload: dict):
    # store sample metadata; actual file upload should go to S3
    return {'ok': True}

@app.post('/api/decode/correct')
async def decode_correct(payload: dict):
    # accept correction pairs for fine-tuning
    return {'ok': True}

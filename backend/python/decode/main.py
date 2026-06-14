import os
from typing import Any

import httpx
import socketio
from fastapi import FastAPI
from pydantic import BaseModel


FEATURE_URL = os.getenv('FEATURE_URL', 'http://localhost:8001/internal/features')
CONFORMER_URL = os.getenv('CONFORMER_URL', 'http://localhost:8002/internal/conformer')
RESCORE_URL = os.getenv('RESCORE_URL', 'http://localhost:8003/internal/rescore')
TTS_URL = os.getenv('TTS_URL', 'http://localhost:8004/internal/tts')

api = FastAPI(title='Decode Service')
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = socketio.ASGIApp(sio, other_asgi_app=api)


class EnrolmentSample(BaseModel):
    user_id: str
    label: str
    audio_base64: str


class CorrectRequest(BaseModel):
    user_id: str
    original_text: str
    corrected_text: str


@api.get('/health')
async def health():
    return {'ok': True}


@api.post('/api/enrolment/samples')
async def enrolment_samples(payload: EnrolmentSample):
    return {'stored': True, 'userId': payload.user_id, 'label': payload.label, 'triggeredAdaptation': False}


@api.post('/api/decode/correct')
async def decode_correct(payload: CorrectRequest):
    return {
        'stored': True,
        'userId': payload.user_id,
        'originalText': payload.original_text,
        'correctedText': payload.corrected_text,
    }


async def call_json(url: str, body: dict[str, Any]) -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, json=body)
        response.raise_for_status()
        return response.json()


@sio.event
async def connect(sid, environ):
    await sio.emit('stream', {'type': 'connected'}, to=sid)


@sio.event
async def audio_frame(sid, data):
    user_id = data.get('userId')
    frame = data.get('frame', '')
    ern = data.get('ern', False)
    is_final = bool(data.get('final'))

    features = await call_json(FEATURE_URL, {'user_id': user_id, 'frame': frame})
    conformer = await call_json(CONFORMER_URL, {'user_id': user_id, 'feature_vector': features['featureVector']})
    await sio.emit('partial', {'userId': user_id, 'candidates': conformer['candidates']}, to=sid)

    if ern:
        await sio.emit('ern', {'userId': user_id, 'message': 're-decode requested'}, to=sid)

    if not is_final:
        return

    rescore = await call_json(RESCORE_URL, {'candidates': conformer['candidates'], 'language_hint': data.get('languageHint')})
    tts_response = await call_json(TTS_URL, {'text': rescore['text'], 'emotion': data.get('emotion', 'calm')})

    await sio.emit(
        'final',
        {
            'userId': user_id,
            'text': rescore['text'],
            'audioBytes': tts_response,
        },
        to=sid,
    )


@sio.event
async def disconnect(sid):
    await sio.emit('stream', {'type': 'disconnected'}, to=sid)

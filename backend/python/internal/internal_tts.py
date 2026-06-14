import base64

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title='Internal TTS Engine')


class TTSRequest(BaseModel):
    text: str
    emotion: str | None = 'calm'
    voice_profile: str | None = None


@app.post('/internal/tts')
async def tts(payload: TTSRequest):
    # Stub: replace with Coqui TTS or cloud voice provider.
    audio = f'AUDIO:{payload.emotion}:{payload.text}'.encode('utf-8')
    return {
        'contentType': 'audio/wav',
        'audioBase64': base64.b64encode(audio).decode('utf-8'),
    }

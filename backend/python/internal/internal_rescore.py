from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title='Internal LLM Rescorer')


class RescoreRequest(BaseModel):
    candidates: list[dict]
    language_hint: str | None = None


@app.post('/internal/rescore')
async def rescore(payload: RescoreRequest):
    # Stub: replace with GPT-4o or local model ranking.
    best = payload.candidates[0] if payload.candidates else {'text': '', 'confidence': 0.0}
    return {'text': best.get('text', ''), 'source': 'stub-rescorer'}

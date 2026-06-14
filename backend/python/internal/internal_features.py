from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title='Internal Feature Extractor')


class FeatureRequest(BaseModel):
    user_id: str | None = None
    frame: str
    sample_rate: int | None = 16000


@app.post('/internal/features')
async def features(payload: FeatureRequest):
    # Stub: replace with MFCC + LPC + D-MFCC pipeline.
    vector = [0.12, 0.34, 0.56, 0.78]
    return {'userId': payload.user_id, 'featureVector': vector, 'normalized': True}

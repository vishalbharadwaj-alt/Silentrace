from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title='Internal Conformer Inference')


class ConformerRequest(BaseModel):
    user_id: str | None = None
    feature_vector: list[float]


@app.post('/internal/conformer')
async def conformer(payload: ConformerRequest):
    # Stub: replace with model load + CTC beam search.
    candidates = [
        {'text': 'hello', 'confidence': 0.91},
        {'text': 'help', 'confidence': 0.72},
        {'text': 'halo', 'confidence': 0.51},
        {'text': 'yellow', 'confidence': 0.31},
        {'text': 'hollow', 'confidence': 0.21}
    ]
    return {'userId': payload.user_id, 'candidates': candidates, 'final': False}

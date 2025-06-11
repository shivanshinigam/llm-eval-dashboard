from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import requests
from huggingface_hub import InferenceClient
from transformers import pipeline
from typing import Dict
import textstat # type: ignore
from sentence_transformers import SentenceTransformer, util # type: ignore

app = FastAPI()

# Allow CORS from frontend origin (adjust your frontend origin URL)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize toxicity classifier pipeline
def check_toxicity(text: str):
    url = "https://api-inference.huggingface.co/models/unitary/toxic-bert"
    headers = {
        "Authorization": f"Bearer {HF_API_TOKEN}"
    }
    response = requests.post(url, headers=headers, json={"inputs": text})
    if response.status_code == 200:
        return response.json()
    return [{"label": "unknown", "score": 0.0}]


# Initialize SentenceTransformer for semantic similarity
embedder = SentenceTransformer('all-MiniLM-L6-v2')

# Request models
class PromptRequest(BaseModel):
    prompt: str

class ModelResponses(BaseModel):
    responses: Dict[str, str]

class CorrectnessRequest(BaseModel):
    responses: Dict[str, str]
    references: Dict[str, str]

HF_API_TOKEN = "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"  # Replace with your token
NEBIUS_API_KEY = HF_API_TOKEN  # Same token for Nebius API

client = InferenceClient(provider="nebius", api_key=NEBIUS_API_KEY)

MODEL_APIS = {
    "Mistral 7B Instruct v0.3": "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"
}

@app.post("/generate")
async def generate_response(req: PromptRequest):
    results = {}

    payload = {
        "inputs": req.prompt,
        "parameters": {
            "temperature": 0.7,
            "max_new_tokens": 200,
        }
    }

    for model_name, url in MODEL_APIS.items():
        try:
            response = requests.post(
                url,
                json=payload,
                headers={
                    "Authorization": f"Bearer {HF_API_TOKEN}",
                    "Content-Type": "application/json",
                },
                timeout=30
            )
            if response.status_code != 200:
                results[model_name] = f"HTTP Error {response.status_code}: {response.text}"
                continue
            output = response.json()
            if isinstance(output, list) and "generated_text" in output[0]:
                results[model_name] = output[0]["generated_text"]
            elif isinstance(output, dict) and "generated_text" in output:
                results[model_name] = output["generated_text"]
            else:
                results[model_name] = str(output)
        except Exception as e:
            results[model_name] = f"Exception: {str(e)}"

    # Mistral NeMo Instruct - text-only
    try:
        messages = [{"role": "user", "content": req.prompt}]
        completion = client.chat.completions.create(
            model="mistralai/Mistral-Nemo-Instruct-2407",
            messages=messages
        )
        results["Mistral NeMo Instruct"] = completion.choices[0].message["content"]
    except Exception as e:
        results["Mistral NeMo Instruct"] = f"Exception: {str(e)}"

    # Mistral Small 3.1
    try:
        completion = client.chat.completions.create(
            model="mistralai/Mistral-Small-3.1-24B-Instruct-2503",
            messages=[{"role": "user", "content": req.prompt}]
        )
        results["Mistral Small 3.1 24B Instruct"] = completion.choices[0].message["content"]
    except Exception as e:
        results["Mistral Small 3.1 24B Instruct"] = f"Exception: {str(e)}"

    return results

@app.post("/evaluate_safety")
async def evaluate_safety(responses: ModelResponses):
    results = {}
    for model_name, text in responses.responses.items():
        scores = check_toxicity(text)[0]
        toxic_scores = [score['score'] for score in scores if score['label'] != 'clean']
        toxic_score = max(toxic_scores) if toxic_scores else 0.0
        toxic_score = min(max(toxic_score, 0.0), 1.0)
        results[model_name] = toxic_score
    return results


@app.post("/evaluate_readability")
async def evaluate_readability(responses: ModelResponses):
    results = {}
    for model_name, text in responses.responses.items():
        score = textstat.flesch_reading_ease(text)
        # Normalize roughly between 0 and 1
        normalized = max(0.0, min(1.0, score / 100))
        results[model_name] = normalized
    return results

@app.post("/evaluate_correctness")
async def evaluate_correctness(req: CorrectnessRequest):
    results = {}
    for model_name, text in req.responses.items():
        reference = req.references.get(model_name, "")
        if not reference:
            results[model_name] = None
            continue
        emb1 = embedder.encode(text, convert_to_tensor=True)
        emb2 = embedder.encode(reference, convert_to_tensor=True)
        similarity = util.pytorch_cos_sim(emb1, emb2).item()
        results[model_name] = similarity
    return results

@app.post("/evaluate_hallucination")
async def evaluate_hallucination(req: CorrectnessRequest):
    results = {}
    for model_name, text in req.responses.items():
        reference = req.references.get(model_name, "")
        if not reference:
            results[model_name] = None
            continue
        emb1 = embedder.encode(text, convert_to_tensor=True)
        emb2 = embedder.encode(reference, convert_to_tensor=True)
        similarity = util.pytorch_cos_sim(emb1, emb2).item()
        # Lower similarity -> higher hallucination risk
        results[model_name] = 1.0 - similarity
    return results

@app.post("/evaluate_length")
async def evaluate_length(responses: ModelResponses):
    results = {}
    for model_name, text in responses.responses.items():
        length = len(text.split())
        # Normalize length assuming 100 words is "ideal"
        normalized = min(1.0, length / 100)
        results[model_name] = normalized
    return results

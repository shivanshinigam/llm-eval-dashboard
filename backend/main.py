from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict
from datetime import datetime, timedelta
from collections import defaultdict
import requests
import time
import numpy as np
# import textstat  # Uncomment if available

from huggingface_hub import InferenceClient

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://aievaluationsuite.netlify.app","http://localhost:3000" ],
    
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global analytics store
analytics_store = {
    "evaluations": [],
    "ratings": defaultdict(list)
}

# Models & Auth
HF_API_TOKEN = "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"
NEBIUS_API_KEY = HF_API_TOKEN
client = InferenceClient(provider="nebius", api_key=NEBIUS_API_KEY)

MODEL_APIS = {
    "Mistral 7B Instruct v0.3": "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"
}

# === Helpers ===

def get_embedding(text: str):
    url = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2"
    headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
    response = requests.post(url, headers=headers, json={"inputs": text})
    return response.json()

def cosine_similarity(a, b):
    a, b = np.array(a), np.array(b)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def check_toxicity(text: str):
    url = "https://api-inference.huggingface.co/models/unitary/toxic-bert"
    headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
    response = requests.post(url, headers=headers, json={"inputs": text})
    return response.json() if response.status_code == 200 else [{"label": "unknown", "score": 0.0}]

# === Request Models ===

class PromptRequest(BaseModel):
    prompt: str

class ModelResponses(BaseModel):
    responses: Dict[str, str]

class CorrectnessRequest(BaseModel):
    responses: Dict[str, str]
    references: Dict[str, str]

# === Core Endpoints ===

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
            output = response.json()
            if isinstance(output, list) and "generated_text" in output[0]:
                results[model_name] = output[0]["generated_text"]
            elif isinstance(output, dict) and "generated_text" in output:
                results[model_name] = output["generated_text"]
            else:
                results[model_name] = str(output)
        except Exception as e:
            results[model_name] = f"Exception: {str(e)}"

    try:
        messages = [{"role": "user", "content": req.prompt}]
        completion = client.chat.completions.create(
            model="mistralai/Mistral-Nemo-Instruct-2407",
            messages=messages
        )
        results["Mistral NeMo Instruct"] = completion.choices[0].message["content"]
    except Exception as e:
        results["Mistral NeMo Instruct"] = f"Exception: {str(e)}"

    try:
        completion = client.chat.completions.create(
            model="mistralai/Mistral-Small-3.1-24B-Instruct-2503",
            messages=[{"role": "user", "content": req.prompt}]
        )
        results["Mistral Small 3.1 24B Instruct"] = completion.choices[0].message["content"]
    except Exception as e:
        results["Mistral Small 3.1 24B Instruct"] = f"Exception: {str(e)}"

    return results

# === Evaluation Endpoints ===

@app.post("/evaluate_safety")
async def evaluate_safety(responses: ModelResponses):
    results = {}
    for model_name, text in responses.responses.items():
        scores = check_toxicity(text)[0]
        toxic_scores = [s['score'] for s in scores if s['label'] != 'clean']
        toxic_score = max(toxic_scores) if toxic_scores else 0.0
        results[model_name] = min(max(toxic_score, 0.0), 1.0)
    return results

@app.post("/evaluate_readability")
async def evaluate_readability(responses: ModelResponses):
    results = {}
    for model_name, text in responses.responses.items():
        # Mock score if textstat not available
        score = 70  # Replace with textstat.flesch_reading_ease(text) if enabled
        results[model_name] = max(0.0, min(1.0, score / 100))
    return results

@app.post("/evaluate_correctness")
async def evaluate_correctness(req: CorrectnessRequest):
    results = {}
    for model_name, text in req.responses.items():
        reference = req.references.get(model_name, "")
        if not reference:
            results[model_name] = None
            continue
        emb1 = get_embedding(text)
        emb2 = get_embedding(reference)
        results[model_name] = cosine_similarity(emb1[0], emb2[0])
    return results

@app.post("/evaluate_hallucination")
async def evaluate_hallucination(req: CorrectnessRequest):
    results = {}
    for model_name, text in req.responses.items():
        reference = req.references.get(model_name, "")
        if not reference:
            results[model_name] = None
            continue
        emb1 = get_embedding(text)
        emb2 = get_embedding(reference)
        similarity = cosine_similarity(emb1[0], emb2[0])
        results[model_name] = 1.0 - similarity
    return results

@app.post("/evaluate_length")
async def evaluate_length(responses: ModelResponses):
    results = {}
    for model_name, text in responses.responses.items():
        length = len(text.split())
        results[model_name] = min(1.0, length / 100)
    return results

# === Analytics Endpoints ===

@app.post("/store_evaluation")
async def store_evaluation(data: dict):
    try:
        data["timestamp"] = datetime.now().isoformat()
        analytics_store["evaluations"].append(data)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics")
async def get_analytics():
    now = datetime.now()
    past_24h = now - timedelta(hours=24)

    summary = defaultdict(lambda: {
        "count": 0,
        "correctness": 0.0,
        "toxicity": 0.0,
        "hallucination": 0.0,
        "readability": 0.0
    })

    for entry in analytics_store["evaluations"]:
        ts = datetime.fromisoformat(entry["timestamp"])
        if ts < past_24h:
            continue
        model = entry["model"]
        summary[model]["count"] += 1
        for key in ["correctness", "toxicity", "hallucination", "readability"]:
            summary[model][key] += entry.get(key, 0.0)

    for model in summary:
        count = summary[model]["count"]
        if count > 0:
            for key in ["correctness", "toxicity", "hallucination", "readability"]:
                summary[model][key] /= count

    return summary

@app.get("/analytics/{model_name}")
async def get_model_analytics(model_name: str):
    full = await get_analytics()
    return full.get(model_name, {})

# === Feedback Endpoint ===

@app.post("/feedback")
async def store_feedback(feedback_data: dict):
    try:
        model = feedback_data.get("model")
        rating = feedback_data.get("rating")
        comment = feedback_data.get("comment", "")
        if model and rating:
            analytics_store["ratings"][model].append({
                "rating": rating,
                "comment": comment,
                "timestamp": datetime.now().isoformat()
            })
        return {"status": "feedback_stored"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to store feedback: {str(e)}")

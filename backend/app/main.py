from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
import httpx
import os
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import FAISS

load_dotenv()  # reads .env in project root

app = FastAPI(title="Hackathon API")

# CORS for React/Vite in dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # for dev; restrict in production
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/ping")
async def pong():
    return {"status": "ok"}

# Example "LLM proxy" route (optional)

LLM_URL   = os.getenv("LLM_URL")
LLM_MODEL = os.getenv("LLM_MODEL", "llama3")

@app.get("/chat")
async def chat(q: str):
    async def generate():
        payload = {
            "model": LLM_MODEL,
            "stream": True,
            "messages": [{"role": "user", "content": q}]
        }

        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream("POST", f"{LLM_URL}/api/chat", json=payload) as r:
                async for chunk in r.aiter_bytes():
                    yield chunk

    return StreamingResponse(generate(), media_type="text/plain")

@app.get("/ask")
async def ask(q: str):
    embedder = OllamaEmbeddings(model="nomic-embed-text")
    db = FAISS.load_local("faiss_index", embedder, allow_dangerous_deserialization=True)
    docs = db.similarity_search(q, k=3)
    context = "\n\n".join([doc.page_content for doc in docs])

    prompt = (
        "You are an expert assistant answering based on this text:\n\n"
        f"{context}\n\n"
        f"Question: {q}\nAnswer:"
    )

    async def stream():
        async with httpx.AsyncClient() as client:
            async with client.stream("POST", "http://localhost:11434/api/chat", json={
                "model": "llama3",
                "stream": True,
                "messages": [{"role": "user", "content": prompt}]
            }) as r:
                async for chunk in r.aiter_bytes():
                    yield chunk

    return StreamingResponse(stream(), media_type="text/plain")

import requests # type: ignore
from fastapi import APIRouter, HTTPException
from schemas import ChatRequest, ChatResponse
from dotenv import load_dotenv # type: ignore
import os

load_dotenv()

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:1b")

router = APIRouter()

 
@router.post("/chat", response_model=ChatResponse)
def conversar(dados: ChatRequest):
    try:
        resposta = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": (
                    "Você é o assistente de mobilidade urbana do projeto "
                    "Essência Nova. Responda em português, de forma clara, "
                    "sobre trânsito, mobilidade urbana e segurança viária.\n\n"
                    f"Pergunta: {dados.pergunta}"
                ),
                "stream": False
            },
            timeout=120
        )

        resposta.raise_for_status()
        resultado = resposta.json()

        return {
            "resposta": resultado.get(
                "response",
                "Não foi possível obter uma resposta."
            )
        }

    except requests.exceptions.RequestException as erro:
        raise HTTPException(
            status_code=503,
            detail=f"Não foi possível conectar ao Ollama: {erro}"
        )

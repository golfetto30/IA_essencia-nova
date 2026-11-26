
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.ocorrencias import router as ocorrencias_router
from routes.chat import router as chat_router

app = FastAPI(
    title="Essência Nova",
    description="API de mobilidade urbana e segurança no trânsito",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ocorrencias_router)
app.include_router(chat_router)

@app.get("/")
def inicio():
    return {
        "mensagem": "Backend Essência Nova funcionando!"
    }



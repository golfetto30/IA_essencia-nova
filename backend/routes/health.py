from fastapi import APIRouter

router = APIRouter(tags=["Sistema"])


@router.get("/")
def inicio():
    return {
        "projeto": "Essência Nova",
        "descricao": "Mobilidade urbana e segurança no trânsito",
        "api": "online",
        "porta": 8000
    }


@router.get("/health")
def health():
    return {
        "status": "ok",
        "api": "online"
    }

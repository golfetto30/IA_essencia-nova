from fastapi import APIRouter

router = APIRouter()

ocorrencias = []

@router.get("/ocorrencias")
def listar_ocorrencias():
    return ocorrencias


@router.post("/ocorrencias")
def registrar_ocorrencia(dados: dict):
    ocorrencias.append(dados)

    return {
        "mensagem": "Ocorrência registrada com sucesso!",
        "ocorrencia": dados
    }
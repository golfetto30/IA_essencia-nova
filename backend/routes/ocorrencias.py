
from fastapi import APIRouter, HTTPException
from database import supabase
from schemas import OcorrenciaCreate, OcorrenciaUpdate

router = APIRouter()


@router.get("/ocorrencias")
def listar_ocorrencias():
    try:
        resposta = supabase.table("ocorrencias").select("*").execute()
        return resposta.data
    except Exception as erro:
        raise HTTPException(status_code=500, detail=str(erro))


@router.post("/ocorrencias")
def registrar_ocorrencia(dados: OcorrenciaCreate):
    try:
        dados_envio = dados.model_dump()

        print("DADOS ENVIADOS AO SUPABASE:", dados_envio)

        resposta = supabase.table("ocorrencias").insert(
            dados_envio
        ).execute()

        return {
            "mensagem": "Ocorrência registrada com sucesso!",
            "ocorrencia": resposta.data
        }

    except Exception as erro:
        raise HTTPException(status_code=500, detail=str(erro))
@router.put("/ocorrencias/{ocorrencia_id}")
def atualizar_ocorrencia(ocorrencia_id: int, dados: OcorrenciaUpdate):
    try:
        atualizacao = dados.model_dump(exclude_unset=True)

        resposta = (
            supabase.table("ocorrencias")
            .update(atualizacao)
            .eq("id", ocorrencia_id)
            .execute()
        )

        return resposta.data
    except Exception as erro:
        raise HTTPException(status_code=500, detail=str(erro))


@router.delete("/ocorrencias/{ocorrencia_id}")
def excluir_ocorrencia(ocorrencia_id: int):
    try:
        resposta = (
            supabase.table("ocorrencias")
            .delete()
            .eq("id", ocorrencia_id)
            .execute()
        )

        return {
            "mensagem": "Ocorrência excluída com sucesso!",
            "resultado": resposta.data
        }
    except Exception as erro:
        raise HTTPException(status_code=500, detail=str(erro))

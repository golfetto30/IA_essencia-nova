from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class OcorrenciaCreate(BaseModel):
    titulo: str = Field(min_length=3, max_length=150)
    descricao: str = Field(min_length=3)
    categoria: str
    bairro: str
    endereco: Optional[str] = None
    status: str = "Aberta"

    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)


class OcorrenciaUpdate(BaseModel):
    titulo: Optional[str] = None
    descricao: Optional[str] = None
    categoria: Optional[str] = None
    bairro: Optional[str] = None
    endereco: Optional[str] = None
    status: Optional[str] = None
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)


class ChatRequest(BaseModel):
    pergunta: str = Field(min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    resposta: str
    
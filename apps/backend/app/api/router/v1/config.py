import os
from pathlib import Path

from fastapi import APIRouter, HTTPException, status

from app.core.config import settings
from app.schemas.pydantic import LLMApiKeyResponse, LLMApiKeyUpdate


config_router = APIRouter(prefix="/config", tags=["config"])

ENV_PATH = Path(__file__).resolve().parents[4] / ".env"


def _write_env_value(key: str, value: str) -> None:
    value = value or ""
    lines: list[str] = []
    if ENV_PATH.exists():
        lines = ENV_PATH.read_text(encoding="utf-8").splitlines()

    updated = False
    new_lines: list[str] = []
    for line in lines:
        if line.startswith(f"{key}="):
            new_lines.append(f"{key}={value}")
            updated = True
        else:
            new_lines.append(line)

    if not updated:
        new_lines.append(f"{key}={value}")

    text = "\n".join(new_lines) + "\n"
    ENV_PATH.parent.mkdir(parents=True, exist_ok=True)
    ENV_PATH.write_text(text, encoding="utf-8")


@config_router.get("/llm-api-key", response_model=LLMApiKeyResponse)
async def get_llm_api_key() -> LLMApiKeyResponse:
    # Prefer the configured LLM_API_KEY, but fall back to OPENAI_API_KEY so
    # the UI can display the key even when using OpenAI environment vars.
    current = (
        settings.LLM_API_KEY
        or os.getenv("LLM_API_KEY")
        or os.getenv("OPENAI_API_KEY")
        or ""
    )
    return LLMApiKeyResponse(api_key=current or "")


@config_router.put("/llm-api-key", response_model=LLMApiKeyResponse)
async def update_llm_api_key(payload: LLMApiKeyUpdate) -> LLMApiKeyResponse:
    try:
        clean_value = payload.api_key or ""
        # Persist the generic LLM_API_KEY and also write OPENAI_API_KEY so
        # deployments that expect OpenAI environment variables pick it up.
        _write_env_value("LLM_API_KEY", clean_value)
        _write_env_value("OPENAI_API_KEY", clean_value)
        settings.LLM_API_KEY = clean_value  # type: ignore[attr-defined]
        os.environ["LLM_API_KEY"] = clean_value
        os.environ["OPENAI_API_KEY"] = clean_value
        return LLMApiKeyResponse(api_key=clean_value)
    except OSError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to persist API key.",
        ) from exc

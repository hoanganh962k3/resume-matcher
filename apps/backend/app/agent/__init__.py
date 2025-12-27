# Generic async LLM-agent - automatic provider selection

# * If caller supplies `openai_api_key` (arg or ENV), we use OpenAIProvider.
# * Other providers can be configured via LLM_PROVIDER setting.

from .manager import AgentManager, EmbeddingManager

__all__ = ["AgentManager", "EmbeddingManager"]

import os
import logging

from openai import OpenAI
from typing import Any, Dict
from fastapi.concurrency import run_in_threadpool

from ..exceptions import ProviderError
from .base import Provider, EmbeddingProvider
from ...core import settings

logger = logging.getLogger(__name__)

class OpenAIProvider(Provider):
    """
    OpenAI provider implementation.
    """
    def __init__(self, api_key: str | None = None, model_name: str = settings.LL_MODEL,
                 opts: Dict[str, Any] = None):
        if opts is None:
            opts = {}
        api_key = api_key or settings.LLM_API_KEY or os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ProviderError("OpenAI API key is missing")
        self._client = OpenAI(api_key=api_key)
        self.model = model_name
        self.opts = opts
        self.instructions = ""

    def _generate_sync(self, prompt: str, options: Dict[str, Any]) -> str:  # define a synchronous helper that takes a prompt and generation options and returns generated text
        try:  # start a try block to catch any errors from the API call
            response = self._client.responses.create(  # call the OpenAI client to create a response and assign it to `response`
                model=self.model,  # pass the model name configured on this provider instance
                instructions=self.instructions,  # pass any instructions set on this provider instance
                input=prompt,  # provide the user's prompt as the input to the model
                **options,  # spread any additional generation options into the request
            )
            return response.output_text  # return the textual output produced by the API
        except Exception as e:  # catch any exception raised during the API call
            raise ProviderError(f"OpenAI - error generating response: {e}") from e  # wrap and re-raise as a ProviderError including the original exception

    async def __call__(self, prompt: str, **generation_args: Any) -> str:
        if generation_args:
            logger.warning(f"OpenAIProvider - generation_args not used {generation_args}")
        myopts = {
            "temperature": self.opts.get("temperature", 0),
            "top_p": self.opts.get("top_p", 0.9),
            # top_k not currently supported by any OpenAI model - https://community.openai.com/t/does-openai-have-a-top-k-parameter/612410
            #            "top_k": generation_args.get("top_k", 40),
            # neither max_tokens
            #            "max_tokens": generation_args.get("max_length", 20000),
        }
        return await run_in_threadpool(self._generate_sync, prompt, myopts)


class OpenAIEmbeddingProvider(EmbeddingProvider):
    def __init__(
            self,
            api_key: str | None = None,
            embedding_model: str = settings.EMBEDDING_MODEL,
    ):
        api_key = api_key or settings.EMBEDDING_API_KEY or os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ProviderError("OpenAI API key is missing")
        self._client = OpenAI(api_key=api_key)
        self._model = embedding_model

    async def embed(self, text: str) -> list[float]:
        try:
            response = await run_in_threadpool(
                self._client.embeddings.create, input=text, model=self._model
            )
            return response.data[0].embedding
        except Exception as e:
            raise ProviderError(f"OpenAI - error generating embedding: {e}") from e

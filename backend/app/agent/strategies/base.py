from abc import ABC, abstractmethod
from typing import Any, Dict

from backend.app.agent.providers.base import Provider


class Strategy(ABC):
    """
    Abstract base class for agent strategies.
    """

    @abstractmethod
    async def __call__(self,prompt: str, provider: Provider, **generation_args: Any) -> Dict[str, Any]:


        """
        Execute the strategy using the given prompt and provider.

        Args:
            prompt: The prompt to be processed.
            provider: The provider to use for processing the prompt.
            **generation_args: Additional arguments for generation.
        Returns:
            A dictionary containing the results of the strategy execution.
        """

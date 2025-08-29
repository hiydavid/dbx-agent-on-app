from operator import itemgetter
from typing import AsyncGenerator
from uuid import uuid4

import mlflow
from databricks_langchain import ChatDatabricks
from langchain.prompts import ChatPromptTemplate
from langchain_core.messages import BaseMessage
from langchain_core.runnables import RunnableLambda
from mlflow.types.responses import ResponsesAgentResponse, ResponsesAgentStreamEvent

from agent_server.mlflow_config import setup_mlflow
from agent_server.server import create_server, invoke, stream

# Enable MLflow tracing
mlflow.langchain.autolog()

llm = ChatDatabricks(model="databricks-claude-sonnet-4")

# Define components
prompt = ChatPromptTemplate.from_template(
    """Previous conversation:
{chat_history}

User's question:
{question}"""
)

# Chain definition
chain = (
    {
        "question": itemgetter("input")
        | RunnableLambda(lambda messages: messages[-1]["content"]),
        "chat_history": itemgetter("input") | RunnableLambda(lambda messages: messages[:-1]),
    }
    | prompt
    | llm
)


# Example for ResponsesAgent
@invoke()
async def invoke(data: dict) -> dict:
    """Responses agent predict function - expects inputs format."""
    result = await chain.ainvoke(data)
    
    # Handle different response types from the LLM
    if hasattr(result, 'content'):
        # AIMessage response
        text_content = result.content
    elif isinstance(result, str):
        # String response
        text_content = result
    else:
        # Fallback for other response types
        text_content = str(result)
    
    # Convert the LLM response to ResponsesAgentResponse format
    return {
        "output": [
            {
                "type": "message",
                "role": "assistant", 
                "id": str(uuid4()),
                "content": [{"type": "output_text", "text": text_content}],
            }
        ]
    }


@stream()
async def stream(
    data: dict,
) -> AsyncGenerator[dict, None]:
    content = ""
    async for chunk in chain.astream(data):
        if hasattr(chunk, 'content') and chunk.content:
            content += chunk.content
            yield {
                "type": "response.output_item.done",
                "item": {
                    "type": "message",
                    "role": "assistant",
                    "id": str(uuid4()),
                    "content": [{"type": "output_text", "text": chunk.content}],
                }
            }


def main():
    server = create_server(agent_type="agent/v1/responses")
    setup_mlflow()
    print("Single endpoint: POST /invocations")

    server.run()


if __name__ == "__main__":
    main()

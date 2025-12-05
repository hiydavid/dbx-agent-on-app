import os
from contextlib import AsyncExitStack, asynccontextmanager
from dataclasses import dataclass
from enum import Enum
from typing import AsyncGenerator

import mlflow
from agents import Agent, Runner, set_default_openai_api, set_default_openai_client
from agents.mcp import MCPServer, MCPServerStreamableHttp, MCPServerStreamableHttpParams
from agents.tracing import set_trace_processors
from databricks.sdk import WorkspaceClient
from mlflow.genai.agent_server import invoke, stream
from mlflow.types.responses import (
    ResponsesAgentRequest,
    ResponsesAgentResponse,
    ResponsesAgentStreamEvent,
)

from agent_server.utils import (
    get_async_openai_client,
    get_databricks_host_from_env,
    get_user_workspace_client,
    process_agent_stream_events,
)

sp_workspace_client = WorkspaceClient()
# NOTE: this will work for all databricks models OTHER than GPT-OSS, which uses a slightly different API
databricks_openai_client = get_async_openai_client(sp_workspace_client)
set_default_openai_client(databricks_openai_client)
set_default_openai_api("chat_completions")
set_trace_processors([])  # use mlflow for trace processing
mlflow.openai.autolog()


# --- MCP Configuration ---


class MCPType(Enum):
    FUNCTIONS = "functions"
    EXTERNAL = "external"


@dataclass
class MCPConfig:
    type: MCPType
    identifier: str  # catalog.schema for functions, connection_name for external


def parse_mcp_configs() -> list[MCPConfig]:
    """Parse MCP server configs from environment variable.

    Format: "type:identifier,type:identifier"
    Examples:
        - "functions:system.ai"
        - "functions:system.ai,external:you-com-dhuang"
        - "functions:system.ai,functions:prod.billing,external:slack-mcp"
    """
    env_value = os.environ.get("MCP_SERVERS", "functions:system.ai")
    if not env_value.strip():
        return []

    configs = []
    for entry in env_value.split(","):
        entry = entry.strip()
        if not entry:
            continue
        if ":" not in entry:
            raise ValueError(f"Invalid MCP config '{entry}': must be 'type:identifier'")

        type_str, identifier = entry.split(":", 1)
        try:
            mcp_type = MCPType(type_str.lower())
        except ValueError:
            raise ValueError(
                f"Unknown MCP type '{type_str}'. Valid types: functions, external"
            )

        configs.append(MCPConfig(type=mcp_type, identifier=identifier))

    return configs


def create_mcp_server(config: MCPConfig) -> MCPServerStreamableHttp:
    """Create an MCP server from config."""
    host = get_databricks_host_from_env()

    if config.type == MCPType.FUNCTIONS:
        # Convert "catalog.schema" to "catalog/schema" for URL
        url_path = config.identifier.replace(".", "/")
        url = f"{host}/api/2.0/mcp/functions/{url_path}"
        name = f"{config.identifier} uc functions mcp"
    elif config.type == MCPType.EXTERNAL:
        url = f"{host}/api/2.0/mcp/external/{config.identifier}"
        name = f"{config.identifier} external mcp"

    return MCPServerStreamableHttp(
        params=MCPServerStreamableHttpParams(
            url=url,
            headers=sp_workspace_client.config.authenticate(),
        ),
        client_session_timeout_seconds=20,
        name=name,
    )


@asynccontextmanager
async def init_mcp_servers() -> AsyncGenerator[list[MCPServer], None]:
    """Initialize all configured MCP servers."""
    async with AsyncExitStack() as stack:
        servers: list[MCPServer] = []

        for config in parse_mcp_configs():
            server = create_mcp_server(config)
            await stack.enter_async_context(server)
            servers.append(server)

        yield servers


def create_coding_agent(mcp_servers: list[MCPServer]) -> Agent:
    return Agent(
        name="code execution agent",
        instructions="""You are a code execution agent. 
        You can execute code and return the results.
        You can also search the web using the you-com MCP.
        """,
        model="databricks-claude-3-7-sonnet",
        mcp_servers=mcp_servers,
    )


@invoke()
async def invoke(request: ResponsesAgentRequest) -> ResponsesAgentResponse:
    # user_workspace_client = get_user_workspace_client()
    async with init_mcp_servers() as mcp_servers:
        agent = create_coding_agent(mcp_servers)
        messages = [i.model_dump() for i in request.input]
        result = await Runner.run(agent, messages)
        return ResponsesAgentResponse(
            output=[item.to_input_item() for item in result.new_items]
        )


@stream()
async def stream(request: dict) -> AsyncGenerator[ResponsesAgentStreamEvent, None]:
    # user_workspace_client = get_user_workspace_client()
    async with init_mcp_servers() as mcp_servers:
        agent = create_coding_agent(mcp_servers)
        messages = [i.model_dump() for i in request.input]
        result = Runner.run_streamed(agent, input=messages)

        async for event in process_agent_stream_events(result.stream_events()):
            yield event

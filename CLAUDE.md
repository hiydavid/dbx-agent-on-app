# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Databricks Responses API agent template that integrates the OpenAI Agents SDK with MLflow's AgentServer. The agent uses MCP (Model Context Protocol) to connect to Unity Catalog functions (specifically `system.ai.python_exec` for code execution).

## Development Commands

```bash
# First-time setup (installs uv, nvm, databricks CLI, creates MLflow experiment)
./scripts/quickstart.sh

# Start both agent server and chat UI (http://localhost:8000)
./scripts/start-app.sh

# Start agent server only with options
uv run start-server              # default
uv run start-server --reload     # hot-reload on code changes
uv run start-server --port 8001  # custom port
uv run start-server --workers 4  # multiple workers

# Run agent evaluation
uv run agent-evaluate

# Add dependencies
uv add <package_name>
```

## Testing Locally

```bash
# Streaming request
curl -X POST http://localhost:8000/invocations \
  -H "Content-Type: application/json" \
  -d '{ "input": [{ "role": "user", "content": "hi" }], "stream": true }'

# Non-streaming request
curl -X POST http://localhost:8000/invocations \
  -H "Content-Type: application/json" \
  -d '{ "input": [{ "role": "user", "content": "hi" }] }'
```

## Architecture

### Request Flow
1. Requests hit FastAPI server at `/invocations` (handled by MLflow AgentServer)
2. AgentServer routes to `@invoke()` or `@stream()` decorated functions in `agent.py`
3. Agent uses OpenAI Agents SDK `Runner` to process messages with MCP tools
4. Non-API routes are proxied to the Next.js chat UI on port 3000

### Key Files
- **agent_server/agent.py**: Agent logic with `@invoke()` and `@stream()` endpoints. Creates agent with MCP server connection to Databricks UC functions.
- **agent_server/start_server.py**: Initializes MLflow AgentServer, sets up HTTP proxy middleware to forward non-API requests to frontend.
- **agent_server/utils.py**: Auth utilities including `get_user_workspace_client()` for OBO (on-behalf-of) user auth and stream event processing.
- **agent_server/evaluate_agent.py**: MLflow evaluation setup with sample dataset and scorers.

### Authentication
- Local dev: Uses `DATABRICKS_CONFIG_PROFILE` from `.env.local` (OAuth via CLI recommended)
- Deployed: App Service Principal authenticates to Databricks resources
- OBO auth: Use `get_user_workspace_client()` to act as the requesting user

### Environment Configuration
- `.env.local`: Local development settings (created from `.env.example`)
- `app.yaml`: Databricks Apps deployment config with environment variables

## Deployment to Databricks Apps

```bash
# Create app
databricks apps create <app-name>

# Sync and deploy
DATABRICKS_USERNAME=$(databricks current-user me | jq -r .userName)
databricks sync . "/Users/$DATABRICKS_USERNAME/<app-name>"
databricks apps deploy <app-name> --source-code-path /Workspace/Users/$DATABRICKS_USERNAME/<app-name>
```

Deployed apps require OAuth tokens (not PATs) for authentication.

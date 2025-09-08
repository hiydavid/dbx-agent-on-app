# Known Schema Agent

A complete AI agent application with FastAPI backend and React frontend, featuring MLflow compatibility and static file serving from a single port.

## Quick Start

0. **Install dependencies**
   Install the latest versions of `uv` (python package manager) and `nvm` (node version manager):

   - [`uv` installation docs](https://docs.astral.sh/uv/getting-started/installation/)
   - [`nvm` installation`](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating)
   - Run `nvm use 20` to use Node 20 LTS

1. **Create Python venv:**

   ```bash
   uv sync
   ```

2. **Install UI dependencies and build it for prod:**

   ```bash
   (cd ui && npm run build)
   ```

3. **Run the combined server:**

   ```bash
   uv run agent-server
   # If you want to run it in a different port, you can use the --port command to pass it in:
   # uv run agent-server --port 8001
   ```

   The server runs on **port 8000** by default and serves:

   - **UI**: http://localhost:8000 (React app)
   - **API**: http://localhost:8000/invocations

4. **Make API requests:**

   You can generate an OAuth token and query your Databricks App via API:

   ```
   databricks auth login --host <https://host.databricks.com>
   databricks auth token
   ```

   ```
   curl --request POST \
     --url <app-url.databricksapps.com>/invocations \
     --header 'Authorization: Bearer <oauth token>' \
     --header 'content-type: application/json' \
     --data '{
   "input": [{"role": "user", "content": "hi"}],
   "stream": true
   }'
   ```

## Architecture

### Backend (`src/agent_server/`)

- **`agent.py`**: Main agent implementation with tool calling
- **`server.py`**: FastAPI server with static file serving
- **`mlflow_config.py`**: MLflow configuration and Databricks auth setup

### Frontend (`ui/`)

- **React + TypeScript** with Vite build system

### Key Features

- **Unified serving**: Single port (8000) for both API and UI
- **Static file routing**: React app served at `/`, API at `/invocations`
- **MLflow tracing**: Automatic request/response logging

### Backend Development

Update agent_server/agent.py to iterate on your agent. Set the method to call when querying `/invocations` by using the `@invoke` and `@stream` decorators from agent_server/server.py. See an example in src/agent_server/agent.py.

```bash
uv run agent-server
```

To test out your agent,

### Frontend Development

```bash
cd ui
npm install

# Development server (run in a separate terminal window while also running the backend)
npm run dev

# Build for production
npm run build
```

## Deployment

The application is designed for single-port deployment where the FastAPI server serves both the API endpoints and the React UI as static files. This simplifies deployment and eliminates CORS issues.

### Deployment to Databricks Apps

0. **Create a Databricks App**:
   Ensure you haveve the [Databricks CLI](https://docs.databricks.com/aws/en/dev-tools/cli/tutorial) installed and configured

   ```bash
   databricks apps create agent-proto
   ```

1. **Build the UI:**

   ```bash
   (cd ui && npm run build)
   ```

2. **Get your Databricks username and sync files:**

   ```bash
   DATABRICKS_USERNAME=$(databricks current-user me | jq -r .userName)
   databricks sync . "/Users/$DATABRICKS_USERNAME/agent-proto"
   ```

3. **Deploy the app:**
   ```bash
   databricks apps deploy agent-proto --source-code-path /Workspace/Users/$DATABRICKS_USERNAME/agent-proto
   ```

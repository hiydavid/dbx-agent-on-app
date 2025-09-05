# Known Schema Agent

A complete AI agent application with FastAPI backend and React frontend, featuring MLflow compatibility and static file serving from a single port.

## Quick Start

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
   ```

   The server runs on **port 8000** and serves:

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
- **`mlflow_config.py`**: MLflow configuration and setup

### Frontend (`ui/`)

- **React + TypeScript** with Vite build system

### Key Features

- **Unified serving**: Single port (8000) for both API and UI
- **Static file routing**: React app served at `/`, API at `/invocations`
- **Tool integration**: Unity Catalog function support
- **MLflow tracing**: Automatic request/response logging

### Backend Development

Update agent_server/agent.py to iterate on your agent.

```bash
# Install dependencies
uv sync

uv run agent-server
```

### Frontend Development

```bash
cd ui

# Install dependencies
npm install

# Development server (optional - for UI-only dev)
npm run dev

# Build for production
npm run build
```

### File Structure

```
known-schema-agent/
├── src/agent_server/          # Python backend
│   ├── agent.py              # Main agent with tools
│   ├── server.py             # FastAPI server
│   └── mlflow_config.py      # MLflow setup
├── ui/                       # React frontend
│   ├── src/components/       # React components
│   ├── static/               # Built static files (generated)
│   └── package.json          # Frontend dependencies
├── requirements.txt          # Python dependencies
└── README.md                # This file
```

## Deployment

The application is designed for single-port deployment where the FastAPI server serves both the API endpoints and the React UI as static files. This simplifies deployment and eliminates CORS issues.

### Deployment to Databricks Apps

1. **Build the UI (REQUIRED):**

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

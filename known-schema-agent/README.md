# Known Schema Agent

A complete AI agent application with FastAPI backend and React frontend, featuring MLflow compatibility and static file serving from a single port.

## Features

### Backend

- **Single `/invocations` endpoint** that routes based on `stream` parameter
- **MLflow agent type validation** for `agent/v1/responses`
- **Automatic MLflow tracing** for all requests and responses
- **Tool calling support** with Unity Catalog integration
- **Static file serving** for the React UI
- **Unified port 8000** for both API and UI

### Frontend

- **Real-time streaming** chat interface
- **Custom Typography system** matching design standards
- **Rich message rendering** (text, tool calls, reasoning)
- **Responsive design** with clean UI
- **Built-in static serving** from the backend

## Quick Start

1. **Install Python dependencies:**

   ```bash
   source ~/mlflow/ml3.10/bin/activate  # Use your Python environment
   pip install -r requirements.txt
   ```

2. **Install UI dependencies:**

   ```bash
   cd ui
   npm install
   cd ..
   ```

3. **Build the UI for production:**

   ```bash
   npm run build
   ```

4. **Run the combined server:**

   ```bash
   python src/agent_server/agent.py
   ```

   The server runs on **port 8000** and serves:

   - **UI**: http://localhost:8000 (React app)
   - **API**: http://localhost:8000/invocations
   - **Health**: http://localhost:8000/health

5. **Make API requests:**

   ```bash
   # Non-streaming
   curl -X POST http://localhost:8000/invocations \
     -H "Content-Type: application/json" \
     -d '{
       "input": [
         {
           "type": "message",
           "role": "user",
           "content": [{"type": "text", "text": "what is 4*3 in python?"}]
         }
       ]
     }'

   # Streaming
   curl -X POST http://localhost:8000/invocations \
     -H "Content-Type: application/json" \
     -d '{
       "input": [
         {
           "type": "message",
           "role": "user",
           "content": [{"type": "text", "text": "what is 4*3 in python?"}]
         }
       ],
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
- **Custom Typography components** for consistent styling
- **Real-time streaming** via Server-Sent Events
- **Responsive design** with clean UI patterns

### Key Features

- **Unified serving**: Single port (8000) for both API and UI
- **Static file routing**: React app served at `/`, API at `/invocations`
- **Tool integration**: Unity Catalog function support
- **MLflow tracing**: Automatic request/response logging

## Development

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

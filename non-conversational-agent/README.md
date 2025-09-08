# Agent Server

MLflow-compatible agent server with FastAPI that supports both streaming and non-streaming requests.

## Quick Start

1. **Create Python venv:**

   ```bash
   uv sync
   ```

2. **Run the server:**

   ```bash
     uv run agent-server
   ```

   The server runs on **port 8000** and serves the API at http://localhost:8000/invocations

3. **Make API requests:**

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
   "messages": [{"role": "user", "content": "hi"}],
   "stream": true
   }'
   ```

## Create Your Agent

Modify agent_server/agent.py to create your custom agent. Set the method to call when querying `/invocations` by using the `@invoke` and `@stream` decorators from agent_server/server.py.

```python
# in agent.py
from server import invoke, stream, create_server

@invoke()
def my_predict(data: dict) -> dict:
    messages = data.get("messages", [])
    # Your logic here
    return {"response": "hi"}

@stream()
def my_stream(data: dict) -> dict:
    messages = data.get("messages", [])
    # Your streaming logic here
    for chunk in [{"response": "hello"}, {"response": "world"}]:
        yield chunk

server = create_server()
server.run()
```

## Deploying to Databricks Apps

0. **Create a Databricks App**:
   Ensure you have the [Databricks CLI](https://docs.databricks.com/aws/en/dev-tools/cli/tutorial) installed and configured

   ```bash
   databricks apps create agent-proto
   ```

1. **Get your Databricks username and sync files:**

   ```bash
   DATABRICKS_USERNAME=$(databricks current-user me | jq -r .userName)
   databricks sync . "/Users/$DATABRICKS_USERNAME/agent-proto"
   ```

2. **Deploy the app:**
   ```bash
   databricks apps deploy agent-proto --source-code-path /Workspace/Users/$DATABRICKS_USERNAME/agent-proto
   ```

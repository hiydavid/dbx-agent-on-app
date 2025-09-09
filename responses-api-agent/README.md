# Responses API Agent

TODO: general notes about this agent

## Local Devloop

### Set up your local environment

Install the latest versions of `uv` (python package manager) and `nvm` (node version manager):

- [`uv` installation docs](https://docs.astral.sh/uv/getting-started/installation/)
- [`nvm` installation](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating)
- Run the following to use Node 20 LTS:
  ```bash
  nvm use 20
  ```

### Create and link an MLflow experiment to your app

Create an MLflow experiment in Databricks. Refer to the [MLflow experiments documentation](https://docs.databricks.com/aws/en/mlflow/experiments#create-experiment-from-the-workspace) for more info.

```bash
export MLFLOW_EXPERIMENT_ID="1234567890"
export MLFLOW_TRACKING_URI="databricks"
```

### Set up local authentication to Databricks

In order to access Databricks resources from your local machine while developing your agent, you need to authenticate with Databricks. As stated in the [Databricks SDK authentication docs](https://docs.databricks.com/aws/en/dev-tools/sdk-python#authenticate-the-databricks-sdk-for-python-with-your-databricks-account-or-workspace), there are a few ways to authenticate:

- **Use a Databricks configuration profile**

  Refer to the [configuration profiles documentation](https://docs.databricks.com/aws/en/dev-tools/auth/config-profiles) for more info.

  ```bash
  databricks configure
  # Set the configuration profile
  export DATABRICKS_CONFIG_PROFILE="DEFAULT"
  ```

- **Use a personal access token (PAT)**

  Refer to the [PAT documentation](https://docs.databricks.com/aws/en/dev-tools/auth/pat#databricks-personal-access-tokens-for-workspace-users) for more info.

  ```bash
  export DATABRICKS_HOST="https://host.databricks.com"
  export DATABRICKS_TOKEN="dapi_token"
  ```

### Modifying your agent

In order to work with the agent server provided, inside of `agent.py`, we require:

- Call `create_server()` in order to initialize the server.

  - If your agent matches one of `ChatCompletions`, `ChatAgent` or `Responses` API, you can use the server's built-in validators by initializing the server with the following task types:
    - `ChatCompletions` -> `create_server("agent/v1/chat")`
    - `ChatAgent` -> `create_server("agent/v2/chat")`
    - `Responses` -> `create_server("agent/v1/responses")`

- Decorate your non-streaming method with `@invoke()` and your streaming method with `@stream()`.
  - Neither is required, but in order for your agent to be served, at least one decorator must be used.
  - The method(s) can be async or sync, but we recommend async in order to achieve greater request concurrency.
  - The method decorated with `@invoke()` will be called when requests are made to `/invocations` with `"stream": false"` or without a `"stream"` param in the payload.
  - The method decorated with `@stream()` will be called when requests are made to `/invocations` with `"stream": true"`.

Very minimal example:

```python
from agent_server.mlflow_config import setup_mlflow
from agent_server.server import create_server, invoke, stream

@invoke()
async def non_streaming(request: dict) -> dict:
   return dict

@stream()
async def streaming(request: dict) -> AsyncGenerator[dict, None]:
   yield dict

def main(): # called in the pyproject.toml `agent-server` script
   server = create_server() # can optionally include a task type like "agent/v1/responses"
   setup_mlflow()
```

Common changes to make:

- To add dependencies to your agent, modify `pyproject.toml`. Refer to the [python pyproject.toml guide](https://packaging.python.org/en/latest/guides/writing-pyproject-toml/#dependencies-and-requirements) for more info.
- While we have built-in MLflow tracing when calling the methods annotated with `@invoke()` and `@stream()`, you can also further instrument your own agent. Refer to the [MLflow tracing documentation](https://docs.databricks.com/aws/en/mlflow3/genai/tracing/app-instrumentation/) for more info.
  - Search for `"start_span"` within `src/agent_server/server.py` for the built-in implementation.
- Refer to the Agent Framework ["Author AI Agents in Code" documentation](https://docs.databricks.com/aws/en/generative-ai/agent-framework/author-agent) for more information.

### Modifying the UI

Simultaneously run the two commands in separate terminal windows:

```bash
(cd ui && npm run dev)
uv run agent-server
```

Common changes to make:

- Edit index.html to change the UI title and icon.
- Change the port in `ui/src/api/client.ts` if running on a different port. Note that Databricks Apps serve port 8000 by default, which is why it's set to 8000.

### Querying your local agent

Start up the agent server locally:

```bash
(cd ui && npm run build) # build the UI to be served statically
uv run agent-server
# If you want to run it in a different port, you can use the --port command to pass it in. Remember to change the UI port in client.ts
# uv run agent-server --port 8001
```

Now you can either query your agent via the built in UI (served by default at https://localhost:8000) or via REST API request:

```bash
curl -X POST http://localhost:8000/invocations
   -H "Content-Type: application/json"
   -d '{"input":[{"role":"user","content":"hi"}],"stream":true}'
```

## Deploying to Databricks Apps

0. **Create a Databricks App**:
   Ensure you have the [Databricks CLI](https://docs.databricks.com/aws/en/dev-tools/cli/tutorial) installed and configured.

   ```bash
   databricks apps create agent-proto
   ```

1. **Grant the Databricks App service principal (SP) access to your agent's Databricks resources**

   To access resources like serving endpoints, genie spaces, SQL warehouses, and lakebase instances, you can click `edit` on your app home page to grant the App's SP permission. Refer to the [Databricks Apps resources documentation](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/resources) for more info.

   For resources that are not supported yet, refer to the [Agent Framework authentication documentation](https://docs.databricks.com/aws/en/generative-ai/agent-framework/deploy-agent#automatic-authentication-passthrough) for the correct permission level to grant to your app SP. MLflow experiments, UC connections, UC functions, and vector search indexes will be added to the UI soon.

2. **Set the value of `MLFLOW_EXPERIMENT_ID` in `app.yaml`**

   Refer to the [Databricks Apps environment variable documentation](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/environment-variables) for more info.

   ```yml
   env:
   - name: MLFLOW_TRACKING_URI
      value: "databricks"
   - name: MLFLOW_EXPERIMENT_ID
      value: "1234567890"
   ```

3. **Build the UI**

   ```bash
   (cd ui && npm run build)
   ```

4. **Sync local files to your workspace**

   Refer to the [Databricks Apps deploy documentation](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/deploy?language=Databricks+CLI#deploy-the-app) for more info.

   ```bash
   DATABRICKS_USERNAME=$(databricks current-user me | jq -r .userName)
   databricks sync . "/Users/$DATABRICKS_USERNAME/agent-proto"
   ```

5. **Deploy your Databricks App**

   Refer to the [Databricks Apps deploy documentation](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/deploy?language=Databricks+CLI#deploy-the-app) for more info.

   ```bash
   databricks apps deploy agent-proto --source-code-path /Workspace/Users/$DATABRICKS_USERNAME/agent-proto
   ```

6. **Query your agent hosted on Databricks Apps**

   Databricks Apps are queryable via OAuth token. Generate an [OAuth token with your credentials using the Databricks CLI](https://docs.databricks.com/aws/en/dev-tools/cli/authentication#u2m-auth):

   ```bash
   databricks auth login --host <https://host.databricks.com>
   databricks auth token
   ```

   You can now send a request to the `/invocations` endpoint, where your agent is hosted:

   ```bash
   curl -X POST <app-url.databricksapps.com>/invocations \
   -H "Authorization: Bearer <oauth token>" \
   -H "Content-Type: application/json" \
   -d '{ "input": [{ "role": "user", "content": "hi" }], "stream": true }'
   ```

For future updates to the agent, you only need to sync and redeploy your agent. If making changes to the UI, you'll also have to rebuild the UI.

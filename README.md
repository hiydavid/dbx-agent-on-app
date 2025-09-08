# Agents on Apps

The Databricks Agent Platform team is protoyping the development experience of deploying Agents on Databricks Apps instead of Databricks Model Serving.

By deploying agents on Databricks Apps instead of Model Serving, you can:

- Validate authentication with tools, endpoints, genie spaces etc. in seconds instead of having to wait ~15 min for an endpoint to deploy
- Use [MLflow git-based logged models](https://docs.databricks.com/aws/en/mlflow3/genai/prompt-version-mgmt/version-tracking/track-application-versions-with-mlflow) and real time tracing
- Use AI coding tools like Claude Code or Cursor to develop your agent locally
- Tweak behaviors within the async server to handle agent invocation exactly how you desire

Today, there are some rough edges with this CUJ, but we have a lot of future work planned. You can take a look at this [Project Plan](https://docs.google.com/document/d/155XkF9LrgZt8gNBnn0DSnkYXmWeK-lZGTwXxX9UP5vU) to see if a feature you'd like is already planned.

Please feel free to reach out to agent-feedback@databricks.com if you have any feedback or questions!

### In this repo

The templates in this repo have:

- Built-in MLflow tracing
- An async server to query your agent, configured to route requests from `/invocations` to your agent implementation
- Decorators to easily denote stream and invoke methods

#### custom-schema-agent

- Meant for hosting agents that have arbitrary schemas
- UI helpers coming soon to host a custom UI on the same app

#### known-schema-agent

- Meant for deploying Responses API compatible agents
- Has a built in UI dependent on streamed `response.output_item.done` events. Read more in the [MLflow docs for ResponsesAgent](https://mlflow.org/docs/latest/genai/serving/responses-agent#streaming-agent-output).

### Querying your deployed agent

#### Via UI:

If you're deploying a Responses API agent with the known-schema-agent, you can use the built in UI to query your agent via visiting your app URL.

UI helpers for the custom-schema-agent are coming soon.

#### Via API:

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

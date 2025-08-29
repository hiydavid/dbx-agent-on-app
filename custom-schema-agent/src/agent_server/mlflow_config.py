import os
import subprocess

import mlflow


def setup_mlflow():
    """Initialize MLflow tracking and set active model."""
    experiment_name = "/Users/david.tempelmann@databricks.com/dt_test_agent_app"
    assert experiment_name is not None, "You must set an experiment name "

    # Use explicit profile format instead of relying on environment variable
    profile = os.getenv("DATABRICKS_CONFIG_PROFILE", "e2-demo-field")
    mlflow.set_tracking_uri(f"databricks://{profile}")
    mlflow.set_experiment(experiment_name)

    # in a Databricks App, the app name is set in the environment variable DATABRICKS_APP_NAME
    # in local development, we use a fallback app name
    # TODO: add a fallback app name
    app_name = os.getenv("DATABRICKS_APP_NAME", "FALLBACK-LOCAL-APP-NAME")

    # Get current git commit hash for versioning
    try:
        git_commit = (
            subprocess.check_output(["git", "rev-parse", "HEAD"]).decode("ascii").strip()[:8]
        )
        version_identifier = f"git-{git_commit}"
    except subprocess.CalledProcessError:
        version_identifier = "no-git-repo"  # Fallback if not in a git repo
    logged_model_name = f"{app_name}-{version_identifier}"

    # Set the active model context
    active_model_info = mlflow.set_active_model(name=logged_model_name)
    print(
        f"Active LoggedModel: '{active_model_info.name}', Model ID: '{active_model_info.model_id}'"
    )

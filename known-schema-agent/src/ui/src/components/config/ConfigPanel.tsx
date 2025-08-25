import { useState } from "react";
import type { AgentConfig } from "../../schemas/validation";
import {
  Button,
  Input,
  Layout,
  GearIcon,
  ListClearIcon,
  Typography,
} from "@databricks/design-system";

interface ConfigPanelProps {
  config: AgentConfig;
  onConfigChange: (config: AgentConfig) => void;
  onClose: () => void;
}

const ConfigPanel = ({ config, onConfigChange, onClose }: ConfigPanelProps) => {
  const [localConfig, setLocalConfig] = useState<AgentConfig>(config);
  const [hasChanges, setHasChanges] = useState(false);

  const handleConfigChange = (field: keyof AgentConfig, value: string) => {
    const newConfig = { ...localConfig, [field]: value };
    setLocalConfig(newConfig);
    setHasChanges(newConfig.endpoint !== config.endpoint);
  };

  const handleSave = () => {
    onConfigChange(localConfig);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalConfig(config);
    setHasChanges(false);
  };

  return (
    <Layout
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      {/* Header */}
      <div
        style={{
          padding: "24px 24px 20px 24px",
          borderBottom: "1px solid #f1f5f9",
          backgroundColor: "#fafbfc",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#3b82f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <GearIcon size={20} />
            </div>
            <div>
              <Typography.Title level={3} withoutMargins>
                Settings
              </Typography.Title>
              <Typography.Paragraph style={{ margin: "4px 0 0 0" }}>
                Configure your agent connection
              </Typography.Paragraph>
            </div>
          </div>
          <Button
            onClick={onClose}
            componentId="close-config-button"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              padding: 0,
              border: "1px solid #e2e8f0",
              backgroundColor: "white",
            }}
            endIcon={<ListClearIcon size={16} />}
          />
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
        <div style={{ width: "100%" }}>
          {/* Endpoint Configuration */}
          <div>
            <label
              style={{
                fontWeight: "500",
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                color: "#374151",
              }}
            >
              API Endpoint
            </label>
            <Input
              type="url"
              value={localConfig.endpoint}
              onChange={(e) => handleConfigChange("endpoint", e.target.value)}
              placeholder="http://0.0.0.0:8000"
              componentId="endpoint-input"
              style={{
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "14px",
                padding: "12px 16px",
              }}
            />
            <Typography.Paragraph style={{ marginTop: "8px" }}>
              The URL of your agent server
            </Typography.Paragraph>
          </div>
        </div>
      </div>

      {/* Footer */}
      {hasChanges && (
        <div
          style={{
            padding: "20px 24px",
            borderTop: "1px solid #f1f5f9",
            backgroundColor: "#fafbfc",
          }}
        >
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <Button
              onClick={handleSave}
              type="primary"
              componentId="save-config-button"
              endIcon={<ListClearIcon size={16} />}
              style={{
                flex: 1,
                borderRadius: "8px",
                padding: "12px 20px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Save Changes
            </Button>
            <Button
              onClick={handleReset}
              type="tertiary"
              componentId="reset-config-button"
              style={{
                borderRadius: "8px",
                padding: "12px 20px",
                fontSize: "14px",
                fontWeight: "500",
                border: "1px solid #d1d5db",
                backgroundColor: "white",
                color: "#374151",
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ConfigPanel;

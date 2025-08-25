import { useState } from "react";
import { useStreamingChat } from "../../hooks/useAgentApi";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ConfigPanel from "../config/ConfigPanel";
import type { AgentConfig } from "../../schemas/validation";
import {
  Button,
  GearIcon,
  ListClearIcon,
  Header,
  PageWrapper,
} from "@databricks/design-system";

const defaultConfig: AgentConfig = {
  endpoint: "http://0.0.0.0:8000",
};

// Modal component for settings
const SettingsModal = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  config: AgentConfig;
  onConfigChange: (config: AgentConfig) => void;
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          width: "90%",
          maxWidth: "480px",
          maxHeight: "85vh",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid rgba(0, 0, 0, 0.05)",
          animation: "modalSlideIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>
          {`
            @keyframes modalSlideIn {
              from {
                opacity: 0;
                transform: scale(0.95) translateY(-10px);
              }
              to {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }
          `}
        </style>
        <ConfigPanel
          config={config}
          onConfigChange={onConfigChange}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

const ChatContainer = () => {
  const [config, setConfig] = useState<AgentConfig>(defaultConfig);
  const [showConfig, setShowConfig] = useState(false);

  const {
    messages,
    isStreaming,
    sendStreamingMessage,
    stopStreaming,
    clearMessages,
  } = useStreamingChat(config.endpoint);

  const handleSendMessage = async (content: string) => {
    await sendStreamingMessage(content);
  };

  const handleClearChat = () => {
    clearMessages();
  };

  return (
    <PageWrapper>
      <Header
        title="Playground"
        buttons={[
          <Button
            key="settings"
            onClick={() => setShowConfig(true)}
            size="small"
            componentId="settings-button"
            icon={<GearIcon size={16} />}
          />,
          <Button
            key="clear"
            onClick={handleClearChat}
            size="small"
            componentId="clear-chat-button"
            icon={<ListClearIcon size={16} />}
          />,
        ]}
      />

      <div style={{ flex: 1, overflow: "hidden" }}>
        <MessageList messages={messages} isLoading={isStreaming} />
      </div>

      <div style={{ backgroundColor: "white" }}>
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={false}
          isStreaming={isStreaming}
          onStopStreaming={stopStreaming}
        />
      </div>
      <SettingsModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        config={config}
        onConfigChange={setConfig}
      />
    </PageWrapper>
  );
};

export default ChatContainer;

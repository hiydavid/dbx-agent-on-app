import { useStreamingChat } from "../../hooks/useAgentApi";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import {
  Button,
  ListClearIcon,
  Header,
  PageWrapper,
} from "@databricks/design-system";

const ChatContainer = () => {
  const {
    messages,
    isStreaming,
    sendStreamingMessage,
    stopStreaming,
    clearMessages,
  } = useStreamingChat("http://0.0.0.0:8000");

  const handleSendMessage = async (content: string) => {
    await sendStreamingMessage(content);
  };

  const handleClearChat = () => {
    clearMessages();
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Header
        title="Playground"
        buttons={[
          <Button
            key="clear"
            onClick={handleClearChat}
            size="small"
            componentId="clear-chat-button"
            icon={<ListClearIcon size={16} />}
          />,
        ]}
        style={{
          padding: "16px 16px 0",
        }}
      />
      <div style={{ flex: 1, overflow: "hidden" }}>
        <MessageList messages={messages} isLoading={isStreaming} />
      </div>
      <div
        style={{
          position: "sticky",
          bottom: 0,

          zIndex: 10,
        }}
      >
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={false}
          isStreaming={isStreaming}
          onStopStreaming={stopStreaming}
        />
      </div>
    </div>
  );
};

export default ChatContainer;

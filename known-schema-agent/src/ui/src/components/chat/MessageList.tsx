import { useEffect, useRef } from "react";
import type { ResponseInputItem } from "../../schemas/validation";
import ResponseRenderer from "./ConsolidatedRenderer";
import LoadingIndicator from "../common/LoadingIndicator";
import { Typography } from "@databricks/design-system";

interface MessageListProps {
  messages: ResponseInputItem[];
  isLoading: boolean;
}

const MessageList = ({ messages, isLoading }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log(messages);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        padding: "0",
        backgroundColor: "#ffffff",
      }}
    >
      {messages.length === 0 ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <Typography>
              <Typography.Title level={3}>
                Start a conversation
              </Typography.Title>
              <Typography.Paragraph>
                Send a message to begin chatting with the agent
              </Typography.Paragraph>
            </Typography>
          </div>
        </div>
      ) : (
        <div
          style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 24px" }}
        >
          {messages.map((message, index) => (
            <div
              key={`${message.type}-${index}`}
              style={{ marginBottom: "32px" }}
            >
              <ResponseRenderer item={message} />
            </div>
          ))}
          {isLoading && (
            <div
              style={{
                marginBottom: "32px",
                maxWidth: "800px",
                margin: "0 auto",
                padding: "0 24px",
              }}
            >
              <LoadingIndicator />
            </div>
          )}
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;

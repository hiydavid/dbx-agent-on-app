import { useState, type KeyboardEvent } from "react";
import {
  Input,
  StopCircleIcon,
  SendIcon,
  Typography,
} from "@databricks/design-system";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  isStreaming?: boolean;
  onStopStreaming?: () => void;
}

const MessageInput = ({
  onSendMessage,
  disabled = false,
  isStreaming = false,
  onStopStreaming,
}: MessageInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      style={{
        padding: "24px 16px 0",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div
          style={{
            position: "relative",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            backgroundColor: "white",
            overflow: "hidden",
          }}
        >
          <Input.TextArea
            componentId="message-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Start typing ..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{
              width: "100%",
              padding: "16px 50px 16px 16px",
              border: "none",
              outline: "none",
              fontSize: "15px",
              lineHeight: "1.5",
              backgroundColor: "transparent",
              resize: "none",
            }}
          />

          <button
            onClick={isStreaming ? onStopStreaming : handleSubmit}
            disabled={isStreaming ? false : disabled || !message.trim()}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: isStreaming
                ? "#dc2626"
                : disabled || !message.trim()
                ? "#f3f4f6"
                : "#2563eb",
              color: "white",
              cursor: isStreaming
                ? "pointer"
                : disabled || !message.trim()
                ? "not-allowed"
                : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.2s",
            }}
          >
            {isStreaming ? (
              <StopCircleIcon size={16} />
            ) : (
              <SendIcon size={16} />
            )}
          </button>
        </div>

        <div
          style={{
            marginTop: "12px",
            textAlign: "center",
          }}
        >
          <Typography.Paragraph>Press Enter to send</Typography.Paragraph>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;

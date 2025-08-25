import { useState, type KeyboardEvent } from "react";
import { Input, StopCircleIcon } from "@databricks/design-system";

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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };


  return (
    <div
      style={{
        padding: "24px",
        borderTop: "1px solid #e5e7eb",
        backgroundColor: "white",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>

        {/* Main Message Input */}
        <div
          style={{
            position: "relative",
            border: "1px solid #d1d5db",
            borderRadius: "12px",
            backgroundColor: "white",
            overflow: "hidden",
          }}
        >
          <Input
            componentId="message-input"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Start typing ..."
            style={{
              width: "100%",
              padding: "16px 50px 16px 16px",
              border: "none",
              outline: "none",
              fontSize: "15px",
              lineHeight: "1.5",
              backgroundColor: "transparent",
            }}
          />

          <button
            onClick={isStreaming ? onStopStreaming : handleSubmit}
            disabled={isStreaming ? false : (disabled || !message.trim())}
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
              <StopCircleIcon width={16} height={16} />
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>
        </div>

        <div
          style={{
            marginTop: "12px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "#9ca3af",
              fontFamily:
                "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            Press Enter to send
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;

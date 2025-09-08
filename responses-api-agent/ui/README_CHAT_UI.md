# Chat UI Implementation Guide

Detailed documentation for the React chat interface implementation.

## Component Architecture

### Main Container (`ChatContainer.tsx`)

**Purpose**: Root component that orchestrates the entire chat experience.

**Key Features**:
- Custom header with Typography components (not Databricks Header)
- Right-aligned clear button with proper styling
- Flex layout for responsive design
- Integration with streaming chat hooks

```tsx
// Custom header implementation
<div style={{ 
  padding: "16px", 
  display: "flex", 
  justifyContent: "space-between", 
  alignItems: "center",
  borderBottom: "1px solid #e5e7eb"
}}>
  <Title>Playground</Title>
  <Button
    style={{
      border: "1px solid #d1d5db",
      borderRadius: "6px",
      padding: "8px",
      minWidth: "auto",
    }}
    icon={<ListClearIcon size={16} />}
  />
</div>
```

### Message Display (`MessageList.tsx`)

**Purpose**: Renders conversation history with empty state handling.

**Features**:
- Empty state with custom Typography components
- Auto-scroll to latest messages
- Loading indicator integration
- Responsive padding and sizing

**Typography Usage**:
```tsx
<Title style={{ margin: "0 0 16px 0" }}>Start a conversation</Title>
<Paragraph color="#64748b">Send a message to begin chatting with the agent</Paragraph>
```

### Message Input (`MessageInput.tsx`)

**Purpose**: Text input with send functionality and consistent typography.

**Key Implementation**:
- Custom typography for textarea matching Body variant
- Consistent font family and sizing
- Help text using Body component with small size
- Send/stop button integration

```tsx
// Textarea with typography consistency
style={{
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSize: "14px",
  fontWeight: "400",
  lineHeight: 1.5,
  color: "#374151",
}}
```

### Message Rendering (`ConsolidatedRenderer.tsx`)

**Purpose**: Renders different message types (text, tool calls, reasoning).

**Features**:
- Handles text with annotations
- Tool call result display
- Collapsible reasoning sections
- Error message rendering

## Typography System

### Design Philosophy

**Consistent Font Stack**: All text uses Apple system fonts for native appearance.
**Three Variants**: Title, Paragraph, and Body cover all use cases.
**Size Scaling**: Small, medium, large provide flexibility within variants.

### Implementation (`Typography.tsx`)

```tsx
// Base typography styles
const baseStyles = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  margin: 0,
  lineHeight: 1.5,
};

// Variant-specific sizing and colors
switch (variant) {
  case "title": // 18px-24px, semibold
  case "paragraph": // 13px-16px, #374151  
  case "body": // 12px-16px, #64748b
}
```

### Usage Patterns

**Headers and Titles**:
```tsx
<Title>Playground</Title>
<Title size="large">Large Heading</Title>
```

**Main Content**:
```tsx
<Paragraph>Main message content</Paragraph>
<Paragraph color="#64748b">Muted content</Paragraph>
```

**Secondary Text**:
```tsx
<Body>Secondary information</Body>
<Body size="small">Help text and captions</Body>
```

## Streaming Integration

### Hook Implementation (`useStreamingChat.ts`)

**Features**:
- Server-Sent Events parsing
- Real-time message updates
- Stream control (stop/start)
- Error handling and reconnection

**Usage Pattern**:
```tsx
const {
  messages,
  isStreaming, 
  sendStreamingMessage,
  stopStreaming,
  clearMessages,
} = useStreamingChat("http://localhost:8000");
```

### Stream Processing

**Event Types Handled**:
- `response.output_item.done`: Complete message items
- `response.delta`: Text deltas for real-time typing
- `error`: Error messages
- `[DONE]`: Stream completion signal

## Styling Approach

### No Design System Dependencies

**Removed**: Databricks Design System components for text
**Replaced with**: Custom Typography components
**Benefits**: Full control over styling, consistent appearance

### Button Styling

**Improved from Git History**: Restored proper button styling with:
- Border: `1px solid #d1d5db`
- Border radius: `6px`
- Padding: `8px`  
- Min width: `auto`

### Responsive Design

**Layout Strategy**: Flexbox with proper overflow handling
**Mobile-First**: Works on small screens with touch targets
**Scroll Management**: Auto-scroll to latest messages

## API Integration

### Request Format (ResponsesAgentRequest)

```typescript
{
  "input": [
    {
      "type": "message",
      "role": "user",
      "content": [
        {
          "type": "text", 
          "text": "Your message here"
        }
      ]
    }
  ],
  "stream": true // Optional
}
```

### Response Handling

**Non-streaming**: Single JSON response with all output items
**Streaming**: Server-Sent Events with incremental updates
**Error Handling**: Graceful degradation and user feedback

## Build and Deployment

### Production Build

```bash
npm run build
```

**Output Structure**:
- `dist/index.html`: Main HTML entry point
- `dist/assets/`: Bundled CSS and JavaScript
- **Total Size**: ~1MB (mostly Databricks Design System)

### Static File Serving

**FastAPI Integration**: Backend serves built files at root route
**Asset Routing**: `/assets/*` for CSS/JS bundles
**Fallback**: `index.html` for client-side routing

### Performance Considerations

- **Bundle Size**: Large due to design system dependency
- **Load Time**: Single chunk loading
- **Runtime**: React 18 with modern JavaScript

## Development Workflow

### Local Development

1. **UI Only**: `npm run dev` (port 5173)
2. **Full Stack**: Build UI + run Python server (port 8000)
3. **Production**: Built files served by FastAPI

### Testing Integration

**Backend Connection**: UI connects to `http://localhost:8000`
**CORS**: Eliminated by serving from same origin
**API Compatibility**: Uses Response API format consistently
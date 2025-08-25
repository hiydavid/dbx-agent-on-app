import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DesignSystemProvider } from "@databricks/design-system";
import ChatContainer from "./components/chat/ChatContainer";

const queryClient = new QueryClient();

function App() {
  return (
    <DesignSystemProvider>
      <QueryClientProvider client={queryClient}>
        <ChatContainer />
      </QueryClientProvider>
    </DesignSystemProvider>
  );
}

export default App;

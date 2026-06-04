"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { Toaster } from "sonner";
// import { AIChatWidget } from "@/components/support/ai-chat-widget";
import { CustomThemeProvider } from "@/components/ui/theme-provider";
import { RouteLoadingProvider } from "@/components/ui/loading/route-loading-provider";
import { TawkToWidget } from "@/components/integrations/tawk-to-widget";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <CustomThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RouteLoadingProvider>
          {children}
          {/* <AIChatWidget /> */}
          <TawkToWidget />
          <Toaster richColors position="top-right" />
        </RouteLoadingProvider>
      </QueryClientProvider>
    </CustomThemeProvider>
  );
}

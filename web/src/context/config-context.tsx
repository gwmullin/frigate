import { createContext, useContext, ReactNode } from "react";
import { FrigateConfig } from "@/types/frigateConfig";
import useSWR from "swr";
import ActivityIndicator from "@/components/indicators/activity-indicator";

type ConfigContextType = {
  config: FrigateConfig | undefined;
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const { data: config } = useSWR<FrigateConfig>("config", {
    revalidateOnFocus: false,
  });

  // Block render until config is available so all downstream components
  // can safely assume config exists and avoid redundant fetches
  if (!config) {
    return (
      <div className="size-full overflow-hidden">
        <ActivityIndicator className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
    );
  }

  return (
    <ConfigContext.Provider value={{ config }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig(): FrigateConfig {
  const context = useContext(ConfigContext);
  if (!context || !context.config) {
    throw new Error("useConfig must be used within ConfigProvider");
  }
  return context.config;
}

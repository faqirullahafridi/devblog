import { AiHubLayout } from "@/components/platform/ai-layout";
import { AiChatPanel } from "@/components/platform/ai-chat-panel";
import { AI_MODES, getAiMode } from "@/components/platform/ai-config";

export default function AiModePage({ mode }: { mode: string }) {
  const meta = getAiMode(mode);

  return (
    <AiHubLayout
      title={meta.label}
      description={meta.description}
      backHref="/ai"
      backLabel="All modes"
      icon={meta.icon}
      accent={meta.accent}
      iconBg={meta.iconBg}
      compact
    >
      <AiChatPanel initialMode={meta.id} modes={AI_MODES} />
    </AiHubLayout>
  );
}

export function AiModePageWithInput({ mode }: { mode: string }) {
  return <AiModePage mode={mode} />;
}

import { AiStudioShell } from "@/components/platform/ai-layout";
import { AiChatPanel } from "@/components/platform/ai-chat-panel";
import { getAiMode } from "@/components/platform/ai-config";

export default function AiModePage({ mode }: { mode: string }) {
  const meta = getAiMode(mode);

  return (
    <AiStudioShell mode={mode}>
      <AiChatPanel initialMode={meta.id} layout="studio" />
    </AiStudioShell>
  );
}

export function AiModePageWithInput({ mode }: { mode: string }) {
  return <AiModePage mode={mode} />;
}

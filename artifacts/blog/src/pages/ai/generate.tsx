import { useEffect } from "react";
import { useLocation } from "wouter";

/** Generate mode is hidden until site-builder APIs are ready. */
export default function AiGeneratePage() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/ai/chat");
  }, [setLocation]);
  return null;
}

import { createContext, useContext } from "react";

/** True when already inside the app-level PublicLayout shell (avoid double header/footer). */
export const PublicLayoutNestContext = createContext(false);

export function usePublicLayoutNested() {
  return useContext(PublicLayoutNestContext);
}

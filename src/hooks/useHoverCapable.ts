import { useEffect, useState } from "react";

/** true só em dispositivos com hover real (mouse) — usado pra desativar preview em telas touch. */
export function useHoverCapable(): boolean {
  const [capable, setCapable] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setCapable(mq.matches);
    const onChange = () => setCapable(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return capable;
}

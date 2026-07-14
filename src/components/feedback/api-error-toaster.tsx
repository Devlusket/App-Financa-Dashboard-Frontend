"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function ApiErrorToaster() {
  useEffect(() => {
    function handleApiError(event: Event) {
      const message = (event as CustomEvent<string>).detail;
      toast.error("Não foi possível concluir", { description: message });
    }

    window.addEventListener("financa:api-error", handleApiError);
    return () => window.removeEventListener("financa:api-error", handleApiError);
  }, []);

  return null;
}

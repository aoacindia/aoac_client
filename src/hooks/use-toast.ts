import { toast as sonnerToast } from "sonner";

type ToastInput = {
  title?: string;
  description?: string;
  duration?: number;
  variant?: "default" | "destructive";
};

export function useToast() {
  const toast = (input: ToastInput) => {
    const title = input.title ?? "";
    const description = input.description;
    const variant = input.variant ?? "default";
    const prefix = variant === "destructive" ? "Error: " : "";

    if (title && description) {
      sonnerToast(`${prefix}${title} ${description}`, { duration: input.duration });
      return;
    }

    if (title) {
      sonnerToast(`${prefix}${title}`, { duration: input.duration });
      return;
    }

    if (description) {
      sonnerToast(`${prefix}${description}`, { duration: input.duration });
    }
  };

  return { toast };
}


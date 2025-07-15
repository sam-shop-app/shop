import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";

export default function Providers({ children }) {
  return (
    <HeroUIProvider>
      <ToastProvider placement="top-center" toastOffset={16} />
      {children}
    </HeroUIProvider>
  );
}

// AlertProvider.js
import { useState, useCallback, useEffect } from "react";
import { setAlertHandler } from "./AlertService";
import { message } from "antd";

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [messageApi, contextHolder] = message.useMessage();

  const [alertState, setAlertState] = useState<{
    open: boolean;
    message: string;
    title: string;
    severity: "info" | "warning" | "error" | "success";
  }>({
    open: false,
    message: "",
    title: "",
    severity: "info",
  });

  const alert = useCallback(
    (
      message: string,
      title = "",
      severity: "info" | "warning" | "error" | "success" = "info"
    ) => {
      setAlertState({ open: true, message, title, severity });
    },
    []
  );

  useEffect(() => {
    setAlertHandler(alert); // Gán hàm alert toàn cục
  }, [alert]);

  useEffect(() => {
    if (alertState.open) {
      messageApi.open({
        type: alertState.severity,
        content: alertState.message,
        duration: 3,
      });
      setAlertState((prev) => ({ ...prev, open: false })); // Reset trạng thái sau khi hiển thị
    }
  }, [alertState, messageApi]);

  return (
    <>
      {children}
      {contextHolder}
    </>
  );
};

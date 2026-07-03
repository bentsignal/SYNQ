import { Alert, type AlertButton } from "react-native";

type NativeConfirmationAlertParams = {
  body: string;
  cancelLabel: string;
  confirmLabel: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  title: string;
};

export const showNativeConfirmationAlert = ({
  body,
  cancelLabel,
  confirmLabel,
  isDestructive = true,
  onConfirm,
  title,
}: NativeConfirmationAlertParams) => {
  const confirmButton: AlertButton = {
    onPress: onConfirm,
    style: isDestructive ? "destructive" : "default",
    text: confirmLabel,
  };

  Alert.alert(title, body, [
    {
      style: "cancel",
      text: cancelLabel,
    },
    confirmButton,
  ]);
};

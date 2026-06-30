import { type StyleProp, View, type ViewStyle } from "react-native";
import Notification from "./Notification";
import {
  type AppNotification,
  useNotificationsContext,
} from "@/src/features/notifications/context/NotificationsProvider";

type NotificationsProps = {
  customStyles?: StyleProp<ViewStyle>;
};

const Notifications = ({ customStyles }: NotificationsProps) => {
  const { notifications } = useNotificationsContext();

  return (
    <View
      style={[
        customStyles,
        {
          width: "100%",
          justifyContent: "flex-end",
          alignItems: "center",
          zIndex: 10,
        },
      ]}
    >
      {notifications.map((notification: AppNotification) => (
        <Notification
          key={notification.id}
          id={notification.id}
          type={notification.type}
          title={notification.title}
          brief={notification.brief}
          message={notification.message}
          trace={notification.trace}
          onClick={notification.onClick}
        />
      ))}
    </View>
  );
};

export default Notifications;

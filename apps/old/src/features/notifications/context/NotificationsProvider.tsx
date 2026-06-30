import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { NotificationType } from "@/src/constants/Types";

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  brief: string;
  message: string;
  trace: string;
  onClick: () => void;
};

type NotificationsContextValue = {
  notifications: AppNotification[];
  notificationType: NotificationType;
  setNotificationType: Dispatch<SetStateAction<NotificationType>>;
  notificationTitle: string;
  setNotificationTitle: Dispatch<SetStateAction<string>>;
  notificationMessage: string;
  setNotificationMessage: Dispatch<SetStateAction<string>>;
  showNotificationModal: boolean;
  setShowNotificationModal: Dispatch<SetStateAction<boolean>>;
  notificationTrace: string;
  setNotificationTrace: Dispatch<SetStateAction<string>>;
  addNotification: (
    type: NotificationType,
    title: string,
    brief: string,
    message: string,
    trace: string,
    onClick: () => void,
  ) => void;
  removeNotification: (id: string) => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error(
      "useNotificationsContext must be used within NotificationsProvider",
    );
  }

  return context;
};

export const NotificationsProvider = ({ children }: PropsWithChildren) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notificationType, setNotificationType] = useState(
    NotificationType.GENERAL,
  );
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationTrace, setNotificationTrace] = useState("");

  const addNotification = useCallback(
    (
      type: NotificationType,
      title: string,
      brief: string,
      message: string,
      trace: string,
      onClick: () => void,
    ) => {
      const id = Date.now().toString();
      setNotifications((prev) => [
        ...prev,
        { id, type, title, brief, message, trace, onClick },
      ]);
    },
    [],
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      notificationType,
      setNotificationType,
      notificationTitle,
      setNotificationTitle,
      notificationMessage,
      setNotificationMessage,
      showNotificationModal,
      setShowNotificationModal,
      notificationTrace,
      setNotificationTrace,
      addNotification,
      removeNotification,
    }),
    [
      addNotification,
      notificationMessage,
      notificationTitle,
      notificationTrace,
      notificationType,
      notifications,
      removeNotification,
      showNotificationModal,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

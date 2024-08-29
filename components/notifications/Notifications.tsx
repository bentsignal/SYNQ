import { View, Text } from 'react-native';
import { useEffect, useState } from 'react';
import Notification from './Notification';
import { NotificationType } from '@/constants/Types';
import { useGlobalContext } from '@/context/GlobalProvider';

type NotificationsProps = {
  customStyles?: {};
}

const Notifications = ({ customStyles }: NotificationsProps) => {

  const {

    notifications, setNotifications

  } = useGlobalContext();

  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setShow(true);
    }, 5000);
  }, [])

  return (
    <View
      style={[customStyles, {
        width: '100%',
        justifyContent: 'flex-end',
        zIndex: 10
      }]}
    >
      {notifications.map((notification: any) => (
        <Notification
          key={notification.id}
          id={notification.id}
          title={notification.title}
          brief={notification.brief}
          message={notification.message}
          trace={notification.trace}
          type={notification.type}
          onDismiss={() => {
            console.log('dismissed');
          }}
        />
      ))}
    </View>
  );
}

export default Notifications;
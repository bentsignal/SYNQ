import { View } from 'react-native';
import Notification from './Notification';
import { useGlobalContext } from '@/src/context/GlobalProvider';

type NotificationsProps = {
  customStyles?: {};
}

const Notifications = ({ customStyles }: NotificationsProps) => {

  const { notifications } = useGlobalContext();

  return (
    <View
      style={[customStyles, {
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
        zIndex: 10
      }]}
    >
      {notifications.map((notification: any) => (
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
}

export default Notifications;
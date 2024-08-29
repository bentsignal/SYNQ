import { View, Text } from 'react-native';
import { useEffect, useState } from 'react';
import Notification from './Notification';
import { NotificationType } from '@/constants/Types';
import { useGlobalContext } from '@/context/GlobalProvider';

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
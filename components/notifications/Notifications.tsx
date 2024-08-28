import { View, Text } from 'react-native';
import { useEffect, useState } from 'react';
import Notification from './Notification';

type NotificationsProps = {
  customStyles?: {};
}

const Notifications = ({ customStyles }: NotificationsProps) => {

  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setShow(true);
    }, 500);
  }, [])

  return (
    <View
      style={[customStyles, {
        width: '100%',
        height: 50,
        backgroundColor: 'red',
        zIndex: 10
      }]}
    >
      <Notification 
        message="test"
        show={show}
        onDismiss={() => console.log('dismissed')}
      />
    </View>
  );
}

export default Notifications;
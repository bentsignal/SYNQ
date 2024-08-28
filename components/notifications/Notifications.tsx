import { View, Text } from 'react-native';
import { useEffect, useState } from 'react';
import Notification from './Notification';
import { NotificationType } from '@/constants/Types';

type NotificationsProps = {
  customStyles?: {};
}

const Notifications = ({ customStyles }: NotificationsProps) => {

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
      <Notification
        title={'Upload Success'}
        brief={'3 files uploaded'}
        message="test"
        type={NotificationType.GENERAL}
        onDismiss={() => console.log('dismissed')}
      />
      <Notification
        title={'Save Failure'}
        brief={'couuldnt save fart.mp3'}
        message="test"
        type={NotificationType.ERROR}
        onDismiss={() => console.log('dismissed')}
      />
      <Notification 
        title={'Export Failure'}
        brief={'couuldnt export fart.mp3'}
        message="testdfkljasdlkfjas;lkdjf;l ksjdfl;kajsdlfkjas;dlfkj"
        type={NotificationType.ERROR}
        onDismiss={() => console.log('dismissed')}
      />
    </View>
  );
}

export default Notifications;
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { Styles } from '@/constants/Styles';
import { Colors } from '@/constants/Colors';
import { useGlobalContext } from '@/context/GlobalProvider';
import Bar from '@/components/modals/Bar';
import CustomButton from '@/components/CustomButton';

const Premium = () => {

  const { premium, setPremium } = useGlobalContext();

  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: Colors.background
      }}
    >
      <Bar />
      <Text style={Styles.pageTitle}>Test</Text>
      <CustomButton 
        title="Toggle Premium"
        background={Colors.altButton}
        disabledColor={Colors.altDisabled}
        handlePress={() => setPremium(!premium)}
      />
      <Text style={Styles.infoText}>{premium ? 'premium' : 'free'}</Text>
      <CustomButton 
        title="Back"
        background={Colors.altButton}
        disabledColor={Colors.altDisabled}
        handlePress={() => router.back()}
      />
    </View>
  );

}

export default Premium;
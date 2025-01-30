import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Styles } from '@/src/constants/Styles';
import { Colors } from '@/src/constants/Colors';
import Bar from '@/src/components/modals/Bar';
import ModalStyles from '@/src/components/modals/Styles';
import PageTitle from '@/src/components/PageTitle';
import Haptic from "@/src/components/settings/Haptic";
import Theme from "@/src/components/settings/Theme";
import CategoryTitle from "@/src/components/settings/CategoryTitle";
import AppIcon from "@/src/components/settings/AppIcon";

export default function Customization() {

  return (
    <View style={[Styles.body, Local.container]}>
      <Bar />
      <View style={{marginTop: 20}} />
      <PageTitle title="Customization" />
      <ScrollView 
        style={[Local.scrollView]}
        contentContainerStyle={Local.scrollViewContent}
      >
        <View style={Local.contentWrapper}>
          <View style={Local.contentContainer}>
            <CategoryTitle title="Theme" requiresPremium={true}/>
            <View>
              <Theme />
            </View>
            <CategoryTitle title="App Icon" requiresPremium={true}/>
            <View>
              <AppIcon />
            </View>
            <CategoryTitle title="Haptic Feedback" />
            <View>
              <Haptic />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );

}

const Local = StyleSheet.create({
  container: {
    backgroundColor: Colors.popup,
    ...ModalStyles.roundedTop,
  },
  scrollView: {
    width: '100%',
  },
  headerText: {
    color: Colors.text,
    ...Styles.h3,
    marginBottom: 10,
  },
  description: {
    color: Colors.infoText,
    ...Styles.p,
    marginBottom: 20,
    width: '100%',
  },
  scrollViewContent: {
    width: '100%',
  },
  contentWrapper: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '90%',
  },
  loadingContainer: {
    width: '100%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

import { Text, View, Image, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';

import { Styles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";

import PageTitle from '@/components/PageTitle'
import Option from "@/components/Option";
import Top from "@/components/Top";

const Instructions = () => {
  return (
    <SafeAreaView style={Styles.body}>
      <Top />
      <PageTitle title='Instructions'/>
      <View 
        style={[Styles.main, {
          width: '100%',
          paddingBottom: Dimensions.get('screen').height < 700 ? 10 : 0
        }]}>
          <ScrollView style={{paddingRight: 20, width: '100%'}}>
            <View style={{paddingBottom: 5}}>
              <Text
                style={[Styles.infoText, {fontWeight: 'bold'}]}
              >
                1. Enable local files in Spotify
              </Text>
              <Text
                style={[Styles.infoText, {
                  paddingLeft: 16,
                  paddingTop: 5
                }]}
              >
                Spotify → Settings → Local Files ↓
              </Text>
              <Image 
                source={require('@/assets/images/local-files-enable.jpg')}
                style={{width: '100%', height: 200}}
                resizeMode='contain'
              />
            </View>
            <View>
              <Text
                style={[Styles.infoText, {fontWeight: 'bold'}]}
              >
                2. Save your music to:
              </Text>
              <Image 
                source={require('@/assets/images/destination-folder.jpg')}
                style={{width: '100%', height: 250}}
                resizeMode='contain'
              />
              <Text
                style={[Styles.infoText, {paddingBottom: 40}]}
              >
                On My iPhone / Spotify / Synced Files
              </Text>
            </View>
          </ScrollView>
          <LinearGradient
            style={{position:'absolute', bottom:Dimensions.get('screen').height < 700 ? 10 : 0, width:'100%', height:50}}
            colors={['rgba(16, 16, 16, 0)', 'rgba(16, 16, 16, 1)']}
            pointerEvents={'none'}
          />
        </View>
    </SafeAreaView>
  )
}

export default Instructions
import { Text, View, Image, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";

import { Styles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";

import PageTitle from '@/components/PageTitle'
import Option from "@/components/Option";
import Top from "@/components/Top";

const Instructions = () => {
  return (
    <SafeAreaView style={Styles.body}>
      <Top />
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20
        }}
      >
        <TouchableOpacity 
          style={{
            width: 'auto',
            flexDirection: 'row',
            alignItems: 'center',
          }}
          onPress={() => router.replace('settings')}
        >
          <Image 
            source={require('@/assets/icons/back.png')}
            style={{
              height: 15,
              width: 15,
              marginRight: 5
            }}
          />
          <Text 
            style={[Styles.infoText, {
              color: Colors.main
            }]}
          >
            back
          </Text>
        </TouchableOpacity>
      </View>
      <PageTitle title="Instructions" />
      <View 
        style={[Styles.main, {
          width: '100%',
          paddingBottom: Dimensions.get('screen').height < 700 ? 10 : 0
        }]}>
          <ScrollView 
            style={{
              paddingRight: 0, 
              width: '100%'
            }}
            contentContainerStyle={{
              justifyContent: 'flex-start'
            }}
          >
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
                Spotify → Settings → Local Files
              </Text>
              <Image 
                source={require('@/assets/images/local-files-enable.jpg')}
                style={{width: '100%', height: 200}}
                resizeMode='contain'
              />
            </View>
            <View>
              <Text
                style={[Styles.infoText, {fontWeight: 'bold', paddingBottom: 5}]}
              >
                2. Save your music to:
              </Text>
              <Text
                style={[Styles.infoText, {paddingBottom: 10, paddingTop: 5, paddingLeft: 19,}]}
              >
                On My iPhone → Spotify → Synced Files
              </Text>
              <Image 
                source={require('@/assets/images/destination-folder.jpg')}
                style={{width: '100%', height: 250, marginBottom: 40}}
                resizeMode='contain'
              />
              
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
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Styles } from '@/constants/Styles';
import { Colors } from '@/constants/Colors';
import { useGlobalContext } from '@/context/GlobalProvider';
import { LinearGradient } from 'expo-linear-gradient';
import Bar from '@/components/modals/Bar';
import CustomButton from '@/components/CustomButton';
import PageTitle from '@/components/PageTitle';

const Premium = () => {

  const { premium, setPremium } = useGlobalContext();
  
  const [selected, setSelected] = useState(0);
  const [buttonText, setButtonText] = useState('Start 1 month free trial');

  return (
    <View style={[Styles.body, {
      backgroundColor: Colors.background,
      }]}>
      <Bar color={'white'}/>
      {/* <PageTitle title='Premium' /> */}
      <View
        style={{
          height: '100%',
          width: '100%',
          position: 'absolute',
          top: 0,
          zIndex: -1,
        }}
      >
        <View
          style={{
            height: '40%',
            width: '100%',
          }}
        >
          <Image 
            source={require('@/assets/images/premium-bg-downscaled.jpg')}
            style={{
              height: '100%',
              width: '100%'
            }}
            />
          <LinearGradient
            style={{
              position: 'absolute', 
              top: 0,
              width: '100%', 
              height: '100%',
            }}
            colors={['rgba(16, 16, 16, 0)', 'rgba(16, 16, 16, 1)']}
            pointerEvents={'none'}
          />
        </View>
        <View
          style={{
            flexGrow: 1,
            width: '100%',
            justifyContent: 'flex-start',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <Image 
            source={require('@/assets/icons/logo-color.png')}
            style={{
              width: 50,
              height: 50,
              position: 'absolute',
              top: -80
            }}
          />
          <Text
            style={{
              color: 'white',
              fontSize: 28,
              fontWeight: 'bold',
              marginBottom: 20,
            }}
          >
            Premium
          </Text>
          <Text
            style={{
              color: 'white',
              fontSize: 20,
              fontWeight: 'bold',
              width: '80%',
              textAlign: 'center',
            }}
          >
            Ad free. No limits.
          </Text>
          <View
            style={{
              flexDirection: 'row',
              width: '90%',
              justifyContent: 'center',
              gap: 10,
              marginTop: 20,
              marginBottom: 20,
            }}
          >
            <TouchableOpacity 
              style={[Styles.subOption, {
                backgroundColor: selected === 0 ? Colors.main : Colors.song
              }]}
              activeOpacity={1}
              onPress={() => {
                setSelected(0);
                setButtonText('Start 1 month free trial')
              }}
            >
              <Text style={Styles.subClass}>Monthly</Text>
              <Text style={Styles.subCost}>$0.99</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[Styles.subOption, {
                backgroundColor: selected === 1 ? Colors.main : Colors.song
              }]}
              activeOpacity={1}
              onPress={() => {
                setSelected(1);
                setButtonText('Start 3 month free trial')
              }}
            >
              <Text style={Styles.subClass}>Yearly</Text>
              <Text style={Styles.subCost}>$2.99</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[Styles.subOption, {
                backgroundColor: selected === 2 ? Colors.main : Colors.song
              }]}
              activeOpacity={1}
              onPress={() => {
                setSelected(2);
                setButtonText('Purchase')
              }}
            >
              <Text style={Styles.subClass}>Lifetime</Text>
              <Text style={Styles.subCost}>$9.99</Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: 'row',
              paddingBottom: 10
            }}
          >
            <TouchableOpacity
              activeOpacity={.9}
              onPress={() => {
                console.log('TOS')
              }}
            >
              <Text style={{color: 'white'}}>Terms of Service · </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={.9}
              onPress={() => {
                console.log('Privacy')
              }}
            >
              <Text style={{color: 'white'}}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
          <CustomButton 
            title={buttonText}
            background={Colors.main}
            disabledColor={Colors.disabled}
            textColor={Colors.text}
            buttonWidth={240}
          />
          <TouchableOpacity 
            activeOpacity={.9}
            onPress={() => {
              console.log('restore');
            }}
          >
            <Text 
              style={{
                marginTop: 10,
                color: Colors.main,
                fontSize: 16,
              }}
            >
              Restore
            </Text>
          </TouchableOpacity>
        </View>
      </View> 
      {/* <CustomButton 
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
      /> */}
    </View>
  );

}

export default Premium;
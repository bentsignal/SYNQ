import { View, Text, Image, TouchableOpacity, Linking, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Styles } from '@/constants/Styles';
import { Colors } from '@/constants/Colors';
import { useGlobalContext } from '@/context/GlobalProvider';
import { LinearGradient } from 'expo-linear-gradient';
import Bar from '@/components/modals/Bar';
import CustomButton from '@/components/CustomButton';
// import * as IAP from 'react-native-iap';
import PremiumOption from '@/components/premium/PremiumOption';
import Purchases from 'react-native-purchases';
import Loading from '@/components/Loading';

const Premium = () => {

  const { premium, setPremium } = useGlobalContext();
  
  const [selected, setSelected] = useState(0);
  const [renew, setRenew] = useState(true);
  const [loading, setLoading] = useState(true);
  const [end, setEnd] = useState('January 1, 2000');
  const [active, setActive] = useState(false);
  const [purchaseText, setPurchaseText] = useState('Purchase');
  const [monthlyText, setMonthlyText] = useState('Purchase');
  const [yearlyText, setYearlyText] = useState('Purchase');
  const [monthlyOffering, setMonthlyOffering] = useState();
  const [yearlyOffering, setYearlyOffering] = useState();
  const [lifetimeOffering, setLifetimeOffering] = useState();
  const [error, setError] = useState(false);

  useEffect(() => {
    connect();
    fetchOfferings();
  }, [])

  const openURL = (url: string) => {
    Linking.openURL(url).catch((err) => console.error("Failed to open URL:", err));
  };

  const connect = async () => {
    Purchases.configure({
      apiKey: 'appl_qzTfhRrmSegqQhRUukTmiUsVMIq',
      appUserID: null,
    });
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }

  const fetchOfferings = async () => {
    try {
      // const offerings = await Purchases.getOfferings();
    }
    catch (error) {
      console.log(error);
    }
  }

  const purchase = async () => {
    setLoading(true);
    const offerings = await Purchases.getOfferings();
    let name = '';
    if (selected === 0) {
      name = 'Premium Monthly';
    }
    else if (selected === 1) {
      name = 'Premium Yearly';
    }
    else if (selected === 2) {
      name = 'Premium Lifetime';
    }
    if (name) {
      try {
        if (offerings.all 
            && offerings.all[name] 
            && offerings.all[name].availablePackages
          ) {
            try {
              await Purchases.purchasePackage(offerings.all[name].availablePackages[0]);
              setPremium(true);
              Alert.alert(
                'Purchase successful',
                'Thank you for purchasing SYNQ Premium!',
                [{
                  text: 'Ok',
                  onPress: () => {
                    setLoading(false);
                    router.back();
                  }
                }]
              );
              return true;
            }
            catch (error) {
              console.log('Failed purchase');
              setLoading(false);
              return false;
            }
        }
        else {
          setLoading(false);
          console.log('No offerings available');
          return false;
        }
      }
      catch (error) {
        setLoading(false);
        return false;
      }
    }
  }

  const getBottom = () => {
    if (loading) {
      return (
        <Loading height={100} width={200} />
      )
    }
    else if (error) {
      return (
        <Text 
          style={{
            color: Colors.text,
            fontWeight: 'bold',
          }}
        >
          An error occured, please try again later
        </Text>
      )
    }
    else if (active) {
      let first = '';
      let second = '';
      if (selected === 2) {
        first = 'Your subscription will never expire';
        second = 'Thank you for your support 💙';
      }
      else {
        first = `Your subscription will ${renew ? 'renew' : 'expire'} ${end}`;
        second = 'To manage it, visit the App Store';
      }
      return (
        <>
          <Text
            style={{
              color: Colors.text,
              fontWeight: 'bold',
              marginBottom: 10,
            }}
          >
            {first}
          </Text>
          <Text 
            style={{
              color: Colors.text,
            }}
          >
            {second}
          </Text>
        </>
      )
    }
    else {
      return (
        <>
          <View
            style={{
              flexDirection: 'row',
              paddingBottom: 10
            }}
          >
            <TouchableOpacity
              activeOpacity={.9}
              onPress={() => {
                openURL('https://directedbyshawn.com/synq-terms-conditions');
              }}
            >
              <Text style={{color: 'white'}}>Terms of Service · </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={.9}
              onPress={() => {
                openURL('https://directedbyshawn.com/synq-privacy-policy');
              }}
            >
              <Text style={{color: 'white'}}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
          <CustomButton 
            title={purchaseText}
            background={Colors.main}
            disabledColor={Colors.disabled}
            textColor={Colors.text}
            buttonWidth={240}
            handlePress={async () => {
              try {
                const result = await purchase();
                if (result) {
                  console.log('Purchase: Success');
                }
                else {
                  console.log('Purchase: Failed');
                }
              }
              catch (error) {
                console.log(error)
              }
            }}
          />
          <TouchableOpacity 
            activeOpacity={.9}
            onPress={async () => {
              setLoading(true);
              try {
                const restorePurchases = await Purchases.restorePurchases();
                setLoading(false);
              }
              catch (error) {
                console.log(error);
                setLoading(false);
                Alert.alert(
                  'ERROR',
                  'Could not restore purchases',
                  [{
                    text: 'Ok'
                  }]
                )
              }
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
        </>
      )
    }
  }

  return (
    <View style={[Styles.body, {
      backgroundColor: Colors.background,
      }]}>
      <Bar color={'white'}/>
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
              alignItems: 'center',
            }}
          >
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
              <PremiumOption 
                tier={'Monthly'}
                price={'$0.99'}
                loading={loading}
                bgColor={selected === 0 ? Colors.main : Colors.song}
                handler={() => {
                  if (!loading && !active && !error) {
                    setSelected(0);
                    setPurchaseText(monthlyText);
                  }
                }}
              />
              <PremiumOption 
                tier={'Yearly'}
                price={'$2.99'}
                loading={loading}
                bgColor={selected === 1 ? Colors.main : Colors.song}
                handler={() => {
                  if (!loading && !active && !error) {
                    setSelected(1);
                    setPurchaseText(yearlyText);
                  }
                }}
              />
              <PremiumOption 
                tier={'Lifetime'}
                price={'$9.99'}
                loading={loading}
                bgColor={selected === 2 ? Colors.main : Colors.song}
                handler={() => {
                  if (!loading && !active && !error) {
                    setSelected(2);
                    setPurchaseText('Purchase')
                  }
                }}
              />
            </View>
            {getBottom()}
          </View>
        </View>
      </View> 
    </View>
  );

}

export default Premium;
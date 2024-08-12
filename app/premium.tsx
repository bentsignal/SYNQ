import { View, Text, Image, TouchableOpacity } from 'react-native';
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

const monthlyId = 'com.directedbyshawn.synq.SYNQPremiumMonthly';
const yearlyId = 'com.directedbyshawn.synq.SYNQPremiumYearly';
const lifetimeId = 'com.directedbyshawn.synq.SYNQPremiumLifetime';

const Premium = () => {

  const { premium, setPremium } = useGlobalContext();
  
  const [selected, setSelected] = useState(-1);
  const [renew, setRenew] = useState(true);
  const [loading, setLoading] = useState(true);
  const [end, setEnd] = useState('January 1, 2000');
  const [active, setActive] = useState(false);
  const [purchaseText, setPurchaseText] = useState('Purchase');
  const [monthlyText, setMonthlyText] = useState('Purchase');
  const [yearlyText, setYearlyText] = useState('Purchase');
  const [error, setError] = useState(false);

  useEffect(() => {
    connect();
    checkStatus();
    // return () => {
    //   IAP.endConnection();
    // }
  }, [])

  const connect = async () => {
    Purchases.configure({
      apiKey: 'appl_qzTfhRrmSegqQhRUukTmiUsVMIq',
      appUserID: null,
    });
    // try {
    //   await IAP.initConnection();
    // }
    // catch (error) {
    //   console.log(`Error connecting to app store, ${error}`);
    // }
  }

  const checkStatus = async () => {
    try {

      console.log('get');

      // const purchases = await IAP.getAvailablePurchases();

      // // lifetime purchase, no need to look further
      // const lifetimePurchase = purchases.find(purchase => purchase.productId === lifetimeId);
      // if (lifetimePurchase) {
      //   setError(false);
      //   setActive(true);
      //   setSelected(2);
      //   setLoading(false);
      //   return;
      // }

      // // check for recurring sub
      // const monthlyPurchase = purchases.find(purchase => purchase.productId === monthlyId);
      // const yearlyPurchase = purchases.find(purchase => purchase.productId === yearlyId);
      
      // // no sub purchase ever
      // if (!monthlyPurchase && !yearlyPurchase) {
      //   setSelected(0);
      //   setError(false);
      //   setActive(false);
      //   setMonthlyText('Start 1 month free trial');
      //   setYearlyText('Start 3 month free trial');
      //   setSelected(0);
      //   setPurchaseText(monthlyText);
      //   setLoading(false);
      //   return;
      // }

      // previously on either, no trial allowed

      // currently on monthly

      // currently on yearly

    }
    catch (error) {
      console.log(`Error pulling previous purchases, ${error}`);
      setError(true);
      setLoading(false);
    }
    setLoading(false);
  }

  const purchase = async () => {
    // if (selected === 0) {
    //   await IAP.requestSubscription({ 
    //     sku: monthlyId, 
    //     andDangerouslyFinishTransactionAutomaticallyIOS: false, 
    //   });
    // }
    // else if (selected === 1) {
    //   await IAP.requestSubscription({ 
    //     sku: yearlyId,
    //     andDangerouslyFinishTransactionAutomaticallyIOS: false, 
    //   });
    // }
    // else if (selected === 2) {
    //   await IAP.requestPurchase({ sku: lifetimeId });
    // }
    return true;
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
            title={purchaseText}
            background={Colors.main}
            disabledColor={Colors.disabled}
            textColor={Colors.text}
            buttonWidth={240}
            handlePress={async () => {
              const result = await purchase();
            }}
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
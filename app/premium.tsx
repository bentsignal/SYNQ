import { View, Text, Image, TouchableOpacity, Linking, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Styles } from '@/constants/Styles';
import { Colors } from '@/constants/Colors';
import { useGlobalContext } from '@/context/GlobalProvider';
import { LinearGradient } from 'expo-linear-gradient';
import Bar from '@/components/modals/Bar';
import CustomButton from '@/components/CustomButton';
import { NotificationType } from '@/constants/Types';
import Notifications from '@/components/notifications/Notifications';
import PremiumOption from '@/components/PremiumOption';
import Loading from '@/components/Loading';
import { darkenColor } from '@/lib/ColorManager';
import * as Haptics from 'expo-haptics';
import * as PurchaseManager from '@/lib/PurchaseManager';

const Premium = () => {

  const { 
    
    premium, theme,
    logo, haptic,
    
    addNotification,
    
    setPremium, setShowOverlay, 
    setShowNotificationModal,
  
  } = useGlobalContext();
  
  const [selected, setSelected] = useState(0);
  const [renew, setRenew] = useState(true);
  const [loading, setLoading] = useState(true);
  const [end, setEnd] = useState('January 1, 2000');
  const [active, setActive] = useState(false);
  const [purchaseText, setPurchaseText] = useState('Purchase');
  const [monthlyText, setMonthlyText] = useState('Purchase');
  const [yearlyText, setYearlyText] = useState('Purchase');
  const [monthlyCost, setMonthlyCost] = useState('$∞');
  const [yearlyCost, setYearlyCost] = useState('$∞');
  const [lifetimeCost, setLifetimeCost] = useState('$∞');
  const [error, setError] = useState(false);

  const sendErrorNotification = (
    title: string,
    message: string, 
    brief: string, 
    trace: string
  ) => {
    addNotification(
      NotificationType.ERROR,
      'Premium Error',
      brief,
      message,
      trace,
      () => {
        router.back();
        router.back();
        setTimeout(() => {
          setShowOverlay(true);
          setShowNotificationModal(true);
        }, 100);
      }
    );
  }

  useEffect(() => {

    const run = async () => {
      try {
        await PurchaseManager.connect();
        setPrices(await PurchaseManager.getPrices());
        updateStatus(await PurchaseManager.checkStatus());
        setLoading(false);
      }
      catch (error) {
        const trace = error instanceof Error ? error.message : String(error);
        sendErrorNotification(
          'Premium Error',
          'We ran into an issue trying to load premium options, please try again later', 
          'Unable to load options', 
          trace
        );
        setError(true);
        setLoading(false);
      }
    }

    run();
    
  }, [])

  const openURL = (url: string) => {
    Linking.openURL(url).catch((err) => console.error("Failed to open URL:", err));
  };

  const setOption = (option: number, purchaseText: string) => {
    if (!loading && !active && !error) {
      setSelected(option);
      setPurchaseText(purchaseText);
    }
  }

  const setPrices = ({lifetime, monthly, yearly}: {lifetime: string, monthly: string, yearly: string}) => {
    setLifetimeCost(lifetime);
    setMonthlyCost(monthly);
    setYearlyCost(yearly);
  }

  const updateStatus = ({id, renewal, end, trialAvailable}: {id: string, renewal: boolean, end: string, trialAvailable: boolean}) => {
    if (id === '') {
      setActive(false);
      setSelected(1);
      if (trialAvailable) {
        setMonthlyText("Start 1 month free trial");
        setYearlyText("Start 3 month free trial");
        setPurchaseText("Start 3 month free trial");
      }
    }
    else {
      setActive(true);
      setPremium(true);
      setRenew(renewal);
      setEnd(end);
      switch (id) {
        case 'SYNQPremiumMonthly':
          setSelected(0);
          break;
        case 'SYNQPremiumYearly':
          setSelected(1);
          break;
        case 'SYNQPremiumLifetime':
          setSelected(2);
          break;
      }
    }
  }

  const handlePurchase = async () => {
    setLoading(true);
    try {
      let id = '';
      switch (selected) {
        case 0:
          id = 'Premium Monthly';
          break;
        case 1:
          id = 'Premium Yearly';
          break;
        case 2:
          id = 'Premium Lifetime';
          break;
        default:
          throw new Error('Invalid purchase option');
      }
      await PurchaseManager.purchase(id);
      if (haptic) {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      }
      setPremium(true);
      updateStatus(await PurchaseManager.checkStatus());
      setLoading(false);
    }
    catch (error) {
      const trace = error instanceof Error ? error.message : String(error);
      if (!trace.includes('cancelled')) {
        sendErrorNotification(
          'Premium Error',
          'We ran into an issue trying to complete your purchase, please try again later', 
          'Unable to complete purchase', 
          trace
        );
      }
      setLoading(false);
    }
  }

  const handleRestore = async () => {
    setLoading(true);
    try {
      const result = await PurchaseManager.restorePurchases();
      setPremium(true);
      setActive(true);
      let message = 'Successfully restored ';
      if (result === 'SYNQPremiumMonthly') {
        setSelected(0);
        message += 'your monthly subscription.';
      }
      else if (result === 'SYNQPremiumYearly') {
        setSelected(1);
        message += 'your yearly subscription.';
      }
      else if (result === 'SYNQPremiumLifetime') {
        setSelected(2);
        message += 'your lifetime subscription.';
      }
      else {
        message += 'your purchase.';
      }
      if (haptic) {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      }
      Alert.alert('Success', message, [{text: 'Ok'}]);
      setLoading(false);
    }
    catch (error) {
      console.log(error);
      setLoading(false);
      if (haptic) {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error
        )
      }
      Alert.alert(
        'ERROR',
        'Could not restore purchases',
        [{
          text: 'Ok'
        }]
      )
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
        <>
          <Text style={{ color: Colors.text, fontWeight: 'bold', marginBottom: 10 }}>
            An error occured, please try again later
          </Text>
        </>
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
          <Text style={[{ color: Colors.text, fontWeight: 'bold', marginBottom: 10 }]}>
            {first}
          </Text>
          <Text style={{ color: Colors.text }}>
            {second}
          </Text>
        </>
      )
    }
    else {
      return (
        <>
          <View style={{ flexDirection: 'row', paddingBottom: 10 }}>
            <TouchableOpacity
              activeOpacity={.9}
              onPress={() => openURL('https://directedbyshawn.com/synq-terms-conditions')}
            >
              <Text style={{color: 'white'}}>Terms of Service · </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={.9}
              onPress={() => openURL('https://directedbyshawn.com/synq-privacy-policy')}
            >
              <Text style={{color: 'white'}}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
          <CustomButton 
            title={purchaseText}
            background={theme}
            disabledColor={darkenColor(theme, 40, 50)}
            textColor={'black'}
            buttonWidth={240}
            handlePress={handlePurchase}
          />
          <TouchableOpacity 
            activeOpacity={.9}
            onPress={handleRestore}
          >
            <Text style={{ marginTop: 10, color: theme, fontSize: 16 }}>
              Restore
            </Text>
          </TouchableOpacity>
        </>
      )
    }
  }

  return (
    <View style={[Styles.body, { backgroundColor: Colors.background }]}>
      <Bar />
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
            marginTop: 10,
            flexGrow: 1,
            width: '100%',
            justifyContent: 'flex-start',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <Image 
            source={logo}
            style={{
              width: 50,
              height: 50,
              position: 'absolute',
              top: -80
            }}
          />
          <Text
            style={[Styles.h2, {
              color: Colors.text,
              marginBottom: 15,
            }]}
          >
            Premium
          </Text>
          <Text
            style={[Styles.h4, {
              color: Colors.text,
              width: '80%',
              textAlign: 'center',
            }]}
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
                price={monthlyCost}
                loading={loading}
                selected={selected === 0}
                handler={() => {setOption(0, monthlyText)}}
              />
              <PremiumOption
                tier={'Yearly'}
                price={yearlyCost}
                loading={loading}
                selected={selected === 1}
                handler={() => {setOption(1, yearlyText)}}
              />
              <PremiumOption 
                tier={'Lifetime'}
                price={lifetimeCost}
                loading={loading}
                selected={selected === 2}
                handler={() => {setOption(2, 'Purchase')}}
              />
            </View>
            {getBottom()}
          </View>
        </View>
        <Notifications 
          customStyles={{
            position: 'absolute',
            bottom: 30,
          }}
        />
      </View> 
    </View>
  );

}

export default Premium;
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
// import * as IAP from 'react-native-iap';
import PremiumOption from '@/components/PremiumOption';
import Purchases from 'react-native-purchases';
import Loading from '@/components/Loading';
import { darkenColor } from '@/lib/Color';
import { errorHasMessage } from '@/lib/Errors';

const Premium = () => {

  const { 
    
    premium, errorMessage, theme,
    logo, 
    
    addNotification,
    
    setPremium, setErrorMessage, 
    setShowOverlay, setShowNotificationModal,
  
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
        await connect();
        await getPrices();
        await checkStatus();
        setLoading(false);
      }
      catch (error) {
        const trace = errorHasMessage(error as Error) ? (error as Error).message : '';
        sendErrorNotification(
          'Premium Error',
          'We ran into an issue trying to load premium options, please try again later', 
          'Unable to load options', 
          trace
        );
        setError(true);
        setErrorMessage('1: ' + error);
        setLoading(false);
      }
    }

    run();
    
  }, [])

  const openURL = (url: string) => {
    Linking.openURL(url).catch((err) => console.error("Failed to open URL:", err));
  };

  const connect = async () => {
    try {
      Purchases.configure({
        apiKey: 'appl_qzTfhRrmSegqQhRUukTmiUsVMIq',
        appUserID: null,
      });
      return true;
    }
    catch (error) {
      const trace = errorHasMessage(error as Error) ? (error as Error).message : '';
        sendErrorNotification(
          'Connection Error',
          'We ran into an issue connecting to our financial services, so we are unable to load premium info at the moment. Please try again later', 
          'Unable to connect', 
          trace
        );
      setError(true);
      setErrorMessage('2: ' + error);
      return false;
    }
  }
  
  const getMonthName = (monthNumber: number) => {
    return new Date(2024, monthNumber - 1, 1).toLocaleString('en-US', { month: 'long' });
  }

  const getPrices = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings) {
        try {
          const lifetimePrice = offerings.all['Premium Lifetime'].availablePackages[0].product.priceString;
          setLifetimeCost(lifetimePrice);
          const monthlyPrice = offerings.all['Premium Monthly'].availablePackages[0].product.priceString;
          setMonthlyCost(monthlyPrice);
          const yearlyPrice = offerings.all['Premium Yearly'].availablePackages[0].product.priceString;
          setYearlyCost(yearlyPrice);
        }
        catch (error) {
          const trace = errorHasMessage(error as Error) ? (error as Error).message : '';
          sendErrorNotification(
            'Premium Error',
            'We were unable to get a list of all premium offerings unfortunately, please try again later', 
            'Unable to pull offerings', 
            trace
          );
          setError(true);
          setErrorMessage('3: ' + error);
          return false;
        }
      }
    }
    catch (error) {
      console.log('error pulling offerings');
      setError(true);
      setErrorMessage('4: ' + error);
      return false;
    }
  }

  const checkStatus = async () => {
    try {

      const customerInfo = await Purchases.getCustomerInfo();
      const activeSubscriptions = customerInfo.activeSubscriptions;
      const purchases = customerInfo.nonSubscriptionTransactions;
      const all = customerInfo.allPurchaseDates;
      // check for lifetime
      if (purchases.length > 0 && purchases[0].productIdentifier === 'SYNQPremiumLifetime') {
        setActive(true);
        setSelected(2);
      }
      // check for active recurring sub
      else if (activeSubscriptions.length > 0) {
        setActive(true);
        if (activeSubscriptions[0] === 'SYNQPremiumMonthly') {
          setSelected(0);
        }
        else if (activeSubscriptions[0] === 'SYNQPremiumYearly') {
          setSelected(1);
        }
        else if (activeSubscriptions[0] === 'SYNQPremiumLifetime') {
          setSelected(2);
        }
        try {
          if (customerInfo && customerInfo.entitlements && customerInfo.entitlements.active) {
            const entitlement = customerInfo.entitlements.active.Premium;
            setRenew(entitlement.willRenew);
            const periodEnd = entitlement.expirationDate; 
            if (periodEnd) {
              const periodEndDate = new Date(periodEnd);
              let dateString = '';
              const month = getMonthName(periodEndDate.getMonth()+1);
              const day = periodEndDate.getDate();
              const year = periodEndDate.getFullYear();
              dateString = `${month} ${day}, ${year}`;
              setEnd(dateString);
            }
          }
        }
        catch (error) {
          const trace = errorHasMessage(error as Error) ? (error as Error).message : '';
          sendErrorNotification(
            'Premium Error',
            'We ran into an issue trying to get the renewal status of your subscription, please try again later', 
            'Unable to get renewal status', 
            trace
          );
        }
      }
      // check to see if intro offer is available
      else if (Object.keys(all).length === 0) {
        setSelected(1);
        setMonthlyText("Start 1 month free trial");
        setYearlyText("Start 3 month free trial");
        setPurchaseText("Start 3 month free trial");
      }
      return true;
    }
    catch (error) {
      const trace = errorHasMessage(error as Error) ? (error as Error).message : '';
      sendErrorNotification(
        'Premium Error',
        'We ran into an issue trying to get the renewal status of your subscription, please try again later', 
        'Unable to get renewal status', 
        trace
      );
      setError(true);
      setErrorMessage('5: ' + error);
      return false;
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
              setLoading(false);
              checkStatus();
              return true;
            }
            catch (error) {
              const trace = errorHasMessage(error as Error) ? (error as Error).message : '';
              sendErrorNotification(
                'Premium Error',
                'We ran into an issue trying to complete your purchase, please try again later', 
                'Unable to complete purchase', 
                trace
              );
              setLoading(false);
              return false;
            }
        }
        else {
          sendErrorNotification(
            'Premium Error',
            'We were unable to locate any premium offerings, please check back later', 
            'No offerings found', 
            ''
          );
          setLoading(false);
          setError(true);
          setErrorMessage('6: ' + 'No offerings available');
          return false;
        }
      }
      catch (error) {
        const trace = errorHasMessage(error as Error) ? (error as Error).message : '';
          sendErrorNotification(
            'Premium Error',
            'We ran into an unknown issue when loading the page, please try again later', 
            'Unknown error', 
            trace
          );
        setLoading(false);
        setError(true);
        setErrorMessage('7: ' + error);
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
        <>
          <Text 
            style={{
              color: Colors.text,
              fontWeight: 'bold',
              marginBottom: 10,
            }}
          >
            An error occured, please try again later
          </Text>
          {/* <Text 
            style={{
              color: Colors.text,
              textAlign: 'center',
            }}
          >
            {errorMessage}
          </Text> */}
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
            background={theme}
            disabledColor={darkenColor(theme, 40, 50)}
            textColor={'black'}
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
                const trace = errorHasMessage(error as Error) ? (error as Error).message : '';
                sendErrorNotification(
                  'Premium Error',
                  'We ran into an issue trying to complete your purchase, please try again later', 
                  'Unable to complete purchase', 
                  trace
                );
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
                color: theme,
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
                price={monthlyCost}
                loading={loading}
                selected={selected === 0}
                handler={() => {
                  if (!loading && !active && !error) {
                    setSelected(0);
                    setPurchaseText(monthlyText);
                  }
                }}
              />
              <PremiumOption
                tier={'Yearly'}
                price={yearlyCost}
                loading={loading}
                selected={selected === 1}
                handler={() => {
                  if (!loading && !active && !error) {
                    setSelected(1);
                    setPurchaseText(yearlyText);
                  }
                }}
              />
              <PremiumOption 
                tier={'Lifetime'}
                price={lifetimeCost}
                loading={loading}
                selected={selected === 2}
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
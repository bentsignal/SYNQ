import { View, StyleSheet, Text, Dimensions } from "react-native";
import { Styles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import Bar from "@/components/modals/Bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PageTitle from "@/components/PageTitle";
import { ScrollView } from "react-native";
import { SkipLeft, SkipRight } from "@/components/player/Skip";
import PausePlayButtons from "@/components/player/PausePlayButtons";
import CloseButton from "@/components/CloseButton";
import { router } from "expo-router";
import Time from "@/components/player/Time";
import ShuffleButton from "@/components/player/ShuffleButton";

const Queue = () => {

  const insets = useSafeAreaInsets();

  const Local = StyleSheet.create({
    container: {
      backgroundColor: Colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: insets.top + 20,
    },
    footer: {
      backgroundColor: Colors.footer,
      borderTopWidth: 1,
      borderTopColor: Colors.popup,
      height: 150,
      width: '100%',
      justifyContent: 'center',
      paddingBottom: insets.bottom,
      alignItems: 'center',
    },
    controlsContainer: {
      flexDirection: 'row',
      width: Dimensions.get('window').width * 0.85,
      gap: 15,
      // backgroundColor: 'red',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    centerControlsContainer: {
      flexDirection: 'row',
      gap: 15,
      justifyContent: 'center',
      alignItems: 'center',
    },
    pausePlay: {
      width: 50,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  const getItems = () => {
    let items = [];
    for (let i = 0; i < 10; i++) {
      items.push(
        <Text key={i} style={{color: Colors.text}}>{i}</Text>
      );
    }
    return items;
  }

  return (
    <View style={[Styles.body, Local.container]}>
      {/* <Bar /> */}
      <PageTitle title="Now Playing"/>
      <ScrollView
        style={{
          width: '100%',
        }}
      >
        {getItems()}
      </ScrollView>
      <View style={Local.footer}>
        <Time/>
        <View style={Local.controlsContainer}>
          <ShuffleButton/>
          <View style={Local.centerControlsContainer}>
            <SkipLeft size={20}/>
            <PausePlayButtons 
              playSize={30}
              pauseHeight={30}
              pauseWidth={9}
              style={Local.pausePlay}
            />
            <SkipRight size={20}/>
          </View>
          <CloseButton action={() => router.back()}/>
        </View>
      </View>
    </View>
  );

}

export default Queue;

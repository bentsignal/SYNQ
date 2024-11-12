import { View, Text, StyleSheet } from "react-native";
import CustomButton from "./CustomButton";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { Styles } from "@/constants/Styles";
import { useGlobalContext } from "@/context/GlobalProvider";

const Ad = () => {

  const { theme } = useGlobalContext();

  return (
    <View style={Local.container}>
      <Text style={Local.header}>Ad</Text>
      <Text style={Local.infoText}>
        Import multiple files at once, and remove all ads with <Text style={{color: theme}}>Premium</Text>
      </Text>
      <CustomButton 
        title="Learn More"
        buttonWidth={150}
        background={theme}
        handlePress={() => router.push('/premium')} 
      />
    </View>
  );
}

const Local = StyleSheet.create({
  header: {
    ...Styles.h3,
    color: Colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  infoText: {
    ...Styles.p,
    color: Colors.infoText,
    marginBottom: 15,
    textAlign: 'center',
  },
  container: {
    zIndex: 10000,
    width: '50%',
    alignItems: 'center',
    marginTop: 20,
  }
});

export default Ad;
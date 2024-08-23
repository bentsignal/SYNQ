import { View, Text, ScrollView } from "react-native";
import { router } from "expo-router";
import PageTitle from '@/components/PageTitle';
import Option from "@/components/Option";
import Bar from "@/components/modals/Bar";
import { Styles } from "@/constants/Styles";
import { Themes, Colors } from "@/constants/Colors";
import ThemeOption from "@/components/settings/ThemeOption";
import Theme from "@/components/settings/Theme";

const Settings = () => {

  return (
    <View style={[Styles.body, {
      backgroundColor: Colors.background,
      }]}>
      <Bar />
      <PageTitle title='Settings'/>
      <Option 
        title="Premium"
        desc="Manage your subcription"
        icon={require('@/assets/icons/premium.png')}
        disabled={false}
        handlePress={() => router.push("/premium")}
      /> 
      <Text style={Styles.settingsCategoryHeader}>Theme</Text>
      <View style={Styles.settingsCategoryContainer}>
        <Theme />
      </View>
    </View>
  );
  
}

export default Settings;
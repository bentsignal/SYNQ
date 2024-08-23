import { View, Text, ScrollView } from "react-native";
import { Styles } from "@/constants/Styles";
import { Themes, Colors } from "@/constants/Colors";
import ThemeOption from "@/components/settings/ThemeOption";

const Theme = () => {
  return (
    <ScrollView 
      horizontal
      style={{
        paddingTop: 15,
        paddingBottom: 15,
        maxHeight: 100,
      }}
    >
        {Object.entries(Themes).map(([key, color], index) => (
          <ThemeOption 
            color={color}
            index={index}
            key={key}
          />
        ))}
      </ScrollView>
  );
}

export default Theme;
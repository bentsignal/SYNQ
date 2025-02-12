import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../constants/Colors";
import { Styles } from "../constants/Styles";
import { useThemeContext } from "../context/ThemeProvider";
import { darkenColor } from "../controllers/ColorController";

type TabSelectorProps = {
  tabs: string[];
  index: number;
  onSelect: (index: number) => void;
}

export default function TabSelector({tabs, index, onSelect}: TabSelectorProps) {
  const { theme } = useThemeContext();
  return (
    <View style={Local.container} >
      {tabs.map((tab, i) => (
        <TouchableOpacity key={i} onPress={() => onSelect(i)} style={[Local.tabWrapper, {
          backgroundColor: index === i ? theme : Colors.song,
        }]}>
          <Text style={[Local.tab, {
            color: index === i ? darkenColor(theme, 50, 30) : Colors.text,
          }]}>{tab}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const Local = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.popup,
    marginBottom: 10,
    paddingBottom: 10,
  },
  tabWrapper: {
    backgroundColor: Colors.song,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tab: {
    ...Styles.h6,
    textAlign: 'center',
    color: Colors.text,
  },
});


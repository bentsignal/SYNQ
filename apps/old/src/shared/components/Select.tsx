import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Colors } from "@/src/constants/Colors";

const Select = ({
  active,
  handlePress,
}: {
  active: boolean;
  handlePress: () => void;
}) => {
  return (
    <TouchableOpacity onPress={handlePress} style={Local.container}>
      <View
        style={[
          Local.icon,
          {
            backgroundColor: active ? Colors.text : Colors.song,
          },
        ]}
      />
    </TouchableOpacity>
  );
};

export default Select;

const Local = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    height: "100%",
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 20,
    marginLeft: 20,
    borderRadius: 10,
    borderColor: Colors.text,
    borderWidth: 1,
  },
});

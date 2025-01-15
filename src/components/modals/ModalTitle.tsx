import { Text } from "react-native";
import { Styles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";

const ModalTitle = ({title}: {title: string;}) => {
  return (
    <Text style={[Styles.h1, { color: Colors.text }]}>
      {title}
    </Text>
  );
}

export default ModalTitle;
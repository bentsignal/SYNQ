import { Text } from "react-native";

const ModalTitle = ({title}: {title: string;}) => {
  return (
    <Text
      style={{
        color: 'white',
        fontSize: 36,
        fontWeight: 'bold'
      }}
    >
      {title}
    </Text>
  );
}

export default ModalTitle;
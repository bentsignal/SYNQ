import { Image, View, TouchableOpacity, StyleSheet } from "react-native";

const Select = ({active, handlePress}: {active: boolean, handlePress: () => void}) => {

  const Local = StyleSheet.create({
    container: {
      display: 'flex',
      justifyContent: 'center',
      height: '100%',
    },
    icon: {
      width: 30,
      height: 30,
      marginRight: 20,
      marginLeft: 20
    }
  });

  return (
    <TouchableOpacity 
      onPress={handlePress}
      style={Local.container}
    >
      <Image 
        source={active ? require('@/assets/icons/selected.png') : require('@/assets/icons/empty-select.png')}
        style={Local.icon}
      />
    </TouchableOpacity>
  );
  
}

export default Select;
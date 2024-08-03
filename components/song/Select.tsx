import { Image, View } from "react-native";

const Select = ({active}: {active: boolean}) => {
  return (
    <View 
      style={{
        display: 'flex',
        justifyContent: 'center',
        height: '100%',
      }}
    >
      <Image 
        source={active ? require('@/assets/icons/selected.png') : require('@/assets/icons/empty-select.png')}
        style={{
          width: 30,
          height: 30,
          marginRight: 20,
          marginLeft: 20
        }}
      />
    </View>
  )
}

export default Select;
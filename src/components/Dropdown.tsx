import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useState } from 'react';
import { Colors } from '@/src/constants/Colors';
import { Styles } from '@/src/constants/Styles';
import Arrow from '@/src/components/Arrow';
import { useThemeContext } from '@/src/context/ThemeProvider';

type DropdownProps = {
  data?: any[];
  placeholder?: string;
  down?: boolean;
  disabled?: boolean;
  containerStyles?: ViewStyle;
  setSelected?: (selected: string) => void;
}

const Dropdown = ({data, placeholder, down, disabled, containerStyles, setSelected}: DropdownProps) => {
  
  const { theme } = useThemeContext();

  const [open, setOpen] = useState(false);

  const toggleOpen = () => {
    setOpen(!open);
  }

  return (
    <TouchableOpacity 
      style={[Styles.roundedContainer, Local.container as ViewStyle, containerStyles, {
        backgroundColor: disabled ? Colors.altDisabled : Colors.altButton,
      }]}
      onPress={toggleOpen}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Text style={Styles.h5}>
        {placeholder ? placeholder : 'Select'}
      </Text>
      <Arrow containerStyle={Local.arrow}/>
    </TouchableOpacity>
  )
}

const Local = StyleSheet.create({
  container: {
    height: 42,
    minWidth: 100,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  arrow: {
    transform: [{translateY: -3}, {rotate: '-135deg'}, {scaleX: 0.8}, {scaleY: 0.8}],
    position: 'absolute',
    right: 20,
    top: 13,
  },
})



export default Dropdown;
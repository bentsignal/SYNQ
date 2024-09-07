import { Text, View, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Styles } from '@/constants/Styles';
import { darkenColor } from '@/lib/ColorManager';
import { useGlobalContext } from '@/context/GlobalProvider';

type ImportInstructionsProps = {
  title: string;
  desc: string;
  icon: ImageSourcePropType;
  disabled?: boolean;
  handlePress: () => void;
};

const ImportInstructions = (

  {
    title,
    desc,
    icon,
    disabled,
    handlePress
  } : ImportInstructionsProps

) => {

  const { theme } = useGlobalContext();

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={1}
      style={[Styles.roundedContainer, {
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%',
        backgroundColor: disabled ? darkenColor(theme, 40, 50) : theme,
        padding: 20,
        marginBottom: 10
      }]}
    >
      <Image 
        source={icon} 
        style={{
          width: 36,
          height: 36,
          marginRight: 16
        }}
      />
      <View>
        <Text style={Styles.p}>
          {title}
        </Text>
        <Text style={Styles.h4}>
          {desc}
        </Text>
      </View>
    </TouchableOpacity>
  );

}

export default ImportInstructions;
import { Text, View, StyleSheet } from 'react-native';
import { Styles } from '@/constants/Styles';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';

type CategoryTitleProps = {
  title: string;
  requiresPremium?: boolean;
}

const CategoryTitle = ({ title, requiresPremium }: CategoryTitleProps) => {

  const { premium } = useGlobalContext();
  const { theme } = useThemeContext();

  const Local = StyleSheet.create({
    container: {
      width: '90%',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginTop: 10,
    },
    premiumNotice: {
      color: theme,
      marginLeft: 5,
    },
  });

  return (
    <View style={Local.container}>
      <Text style={[Styles.h4, { color: Colors.text}]}>
        {title}
      </Text>
      {
        !premium && requiresPremium
        ? <Text style={[Styles.h6, Local.premiumNotice]}>
            Premium
          </Text> 
        : <></>
      }
    </View>
  );
}

export default CategoryTitle;

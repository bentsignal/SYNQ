import { Text, View } from 'react-native';
import { Styles } from '@/constants/Styles';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Colors } from '@/constants/Colors';

type CategoryTitleProps = {
  title: string;
  requiresPremium?: boolean;
}

const CategoryTitle = ({ title, requiresPremium }: CategoryTitleProps) => {

  const { theme, premium } = useGlobalContext();

  return (
    <View
      style={{
        width: '90%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 10,
      }}
    >
      <Text style={Styles.settingsCategoryHeader}>
        {title}
      </Text>
      {!premium && requiresPremium
        ? <Text
            style={{
              color: theme,
              marginLeft: 5,
              fontSize: 12,
              fontWeight: 'bold',
            }}
          >
            Premium
          </Text> 
        : <></>}
    </View>
  );
}

export default CategoryTitle;

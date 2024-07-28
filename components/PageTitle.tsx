import { Text, Image, TouchableOpacity, View } from "react-native";
import { Styles } from "@/constants/Styles"

type PageTitleProps = {
  title: string;
  infoHandler?: () => void;
}

const PageTitle = ({
  title,
  infoHandler
}: PageTitleProps) => {

  const info = () => {
    if (infoHandler) {
      return (
        <TouchableOpacity
          onPress={infoHandler}
        >
          <Image 
            source={require('@/assets/icons/info.png')}
            style={{
              height: 25,
              width: 25,
              marginLeft: 10
            }}
          />
        </TouchableOpacity>
      )
    }
    else {
      return (
        <></>
      )
    }
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignSelf: 'flex-start',
        alignItems: 'center',
        marginBottom: 20
      }}
    >
      <Text style={Styles.pageTitle}>
        {title}
      </Text>
      {info()}
    </View>
  )
}

export default PageTitle;
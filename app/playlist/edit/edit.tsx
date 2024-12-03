import { View, Text, StyleSheet, ScrollView, TextInput } from "react-native";
import { memo } from "react";
import Bar from "@/components/modals/Bar";
import { Colors } from "@/constants/Colors";
import { Styles } from "@/constants/Styles";
import { useEffect, useState } from "react";
import { getPlaylistInfo } from "@/lib/PlaylistManager";
import { router } from "expo-router";
import CustomButton from "@/components/CustomButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeContext } from "@/context/ThemeProvider";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { PlaylistType } from "@/constants/Types";

const MemoizedTextInput = memo(TextInput);

const EditPlaylist = ({id}: {id: string}) => {

  
  const insets = useSafeAreaInsets();
  const { theme } = useThemeContext();
  const [previous, setPrevious] = useState<PlaylistType | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  const refreshInfo = async () => {
    try {
      const result = await getPlaylistInfo(parseInt(id));
      setPrevious(result);
      setName(result.name);
    } catch (error) {
      console.error('error getting playlist info:', error);
    }
  }

  useEffect(() => {
    refreshInfo();
  }, [id]);

  return (
    <View style={Local.wrapper}>
      <Bar />
      <KeyboardAwareScrollView 
        style={Local.scrollView}
        contentContainerStyle={Local.scrollViewContent}
      >
        <Text style={Local.header}>Edit Playlist</Text>
        <Text style={Local.name}>{previous?.name}</Text>
        <Text style={Local.label}>Name</Text>
        <MemoizedTextInput
          style={Local.textBox}
          autoCorrect={true}
          editable
          numberOfLines={1}
          placeholder={'Enter playlist name...'}
          placeholderTextColor={Colors.altDisabled}
          value={name}
          onChangeText={text => setName(text)}
        />
      </KeyboardAwareScrollView>
      <View style={[Local.bottomButtonsWrapper, { paddingBottom: insets.bottom }]}>
        <CustomButton title="Close" handlePress={() => router.back()} />
        <CustomButton 
          title="Save" 
          handlePress={() => {}} 
          background={theme}
        />
      </View>
    </View>
  )
}

const Local = StyleSheet.create({
  wrapper: {
    ...Styles.body,
    backgroundColor: Colors.background,
  },
  scrollView: {
    width: '100%',
    paddingTop: 20,
  },
  scrollViewContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    ...Styles.h1,
    color: Colors.text,
    textAlign: 'left',
    width: '90%',
    marginBottom: 5,
  },
  name: {
    ...Styles.h3,
    color: Colors.infoText,
    textAlign: 'left',
    width: '90%',
    marginBottom: 20,
  },
  bottomButtonsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center', 
    gap: 10,
    width: '100%',
  },
  textBox: {
    ...Styles.textbox,
    ...Styles.roundedContainer,
    width: '90%',
  },
  label: {
    ...Styles.h4,
    color: Colors.text,
    width: '90%',
    textAlign: 'left',
    marginBottom: 10,
  }
})

export default EditPlaylist;
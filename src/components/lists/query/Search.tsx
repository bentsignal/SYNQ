import { View, TextInput, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import React from "react";

type SearchProps = {
  setQuery: (text: string) => void;
  query: string;
}

export default function Search({ setQuery, query }: SearchProps) {
  const inputRef = React.useRef<TextInput>(null);

  return (
    <View style={Local.container}>
      <Image 
        source={require('@/src/assets/icons/search.png')} 
        style={Local.searchImage} 
      />
      <TextInput
        ref={inputRef}
        style={Local.input}
        placeholder="Search"
        onChangeText={setQuery}
        placeholderTextColor={Colors.text}
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect={false}
      />
      {query.length > 0 && (
        <TouchableOpacity 
          style={Local.clearButton} 
          onPress={() => {
            setQuery('');
            inputRef.current?.clear();
          }}
        >
          <Image 
            source={require('@/src/assets/icons/close.png')} 
            style={Local.clearImage} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const Local = StyleSheet.create({
  container: {
    ...Styles.roundedContainer,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: Colors.song,
    paddingLeft: 15,
  },
  searchImage: {
    width: 15,
    height: 15,
    tintColor: Colors.text,
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: Colors.text,
    ...Styles.h6,
    paddingVertical: 12,
  },
  clearButton: {
    paddingHorizontal: 10,
    marginRight: 7,
    paddingVertical: 12,
  },
  clearImage: {
    width: 12,
    height: 12,
    tintColor: Colors.text,
  },
});

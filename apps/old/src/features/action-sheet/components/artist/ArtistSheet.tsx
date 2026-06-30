import Sheet from '@/src/features/action-sheet/components';
import { useActionSheetContext } from '@/src/features/action-sheet/context/ActionSheetProvider';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import ListCover from '@/src/features/cover/components/ListCover';
import SheetStyles from '@/src/features/action-sheet/components/Styles';
import { Styles } from '@/src/constants/Styles';
import { Colors } from '@/src/constants/Colors';
import { CoverType } from '@/src/constants/Types';
import ArtistOptions from '@/src/features/action-sheet/components/artist/ArtistOptions';
import { useSheetScroll } from '@/src/features/action-sheet/hooks/use-sheet-scroll';

const ArtistSheet = ({name}: {name: string}) => {

  const { editArtist } = useActionSheetContext();
  const { handleSheetChange, scrollEnabled, scrollRef } = useSheetScroll();

  return (
    <Sheet name={name} onChange={handleSheetChange}>
      <View style={SheetStyles.infoContainer}>
        <ListCover 
          image={editArtist?.image}
          type={CoverType.ARTIST}
          propOnLoad={() => {}}
          empty={!editArtist?.image}
        />
        <View style={Local.textWrapper}>
          <Text style={Local.name}>{editArtist?.name}</Text>
        </View>
      </View> 
      <ScrollView
        ref={scrollRef}
        scrollEnabled={scrollEnabled}
        style={{
          height: Dimensions.get('window').height
        }}
        contentContainerStyle={{
          paddingBottom: 300,
        }}
      >
        <ArtistOptions name={name}/>
      </ScrollView>
    </Sheet>
  );
}

const Local = StyleSheet.create({
  textWrapper: {
    paddingLeft: 10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  name: {
    ...Styles.h4,
    color: Colors.text,
  },
  count: {
    ...Styles.p,
    color: Colors.infoText,
  },
});

export default ArtistSheet;

import Sheet from '@/src/features/action-sheet/components';
import { useActionSheetContext } from '@/src/features/action-sheet/context/ActionSheetProvider';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import ListCover from '@/src/features/cover/components/ListCover';
import SheetStyles from '@/src/features/action-sheet/components/Styles';
import { Styles } from '@/src/constants/Styles';
import { Colors } from '@/src/constants/Colors';
import { CoverType } from '@/src/constants/Types';
import AlbumOptions from './AlbumOptions';
import { useSheetScroll } from '@/src/features/action-sheet/hooks/use-sheet-scroll';

const AlbumSheet = ({name}: {name: string}) => {

  const { editAlbum } = useActionSheetContext();
  const { handleSheetChange, scrollEnabled, scrollRef } = useSheetScroll();

  return (
    <Sheet name={name} onChange={handleSheetChange}>
      <View style={SheetStyles.infoContainer}>
        <ListCover 
          image={editAlbum?.image}
          type={CoverType.ALBUM}
          propOnLoad={() => {}}
          empty={!editAlbum?.image}
        />
        <View style={Local.textWrapper}>
          <Text style={Local.name}>{editAlbum?.name}</Text>
          {editAlbum?.year && <Text style={Local.year}>{editAlbum.year}</Text>}
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
        <AlbumOptions name={name}/>
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
  year: {
    ...Styles.p,
    color: Colors.infoText,
  },
});

export default AlbumSheet;

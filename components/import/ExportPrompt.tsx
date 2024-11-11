import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useState } from "react";
import { Styles } from "@/constants/Styles";
import PageTitle from "@/components/PageTitle";
import InfoModal from "@/components/modals/InfoModal";
import ImportControls from "@/components/import/ImportControls";
import { useGlobalContext } from "@/context/GlobalProvider";
import CustomButton from "@/components/CustomButton";
import { Colors } from "@/constants/Colors";
import { exportSongs } from '@/lib/SongManager';

const ExportPrompt = () => {

  const { 
    
    importState, theme, results,
    premium,
  
    setHomeState, setShowInfoModal,
    setShowGlobalLoading, 
    setShowGlobalProgress,
  
  } = useGlobalContext();

  const [disabled, setDisabled] = useState(false);

  const handleExport = async () => {
    try {
      setDisabled(true);
      setShowGlobalLoading(true);
      setShowGlobalProgress(false);
      const songs = premium ? results : [results[0]];
      await exportSongs(songs);
      setShowGlobalLoading(false);
      setDisabled(false);
    }
    catch (error) {
      setShowGlobalLoading(false);
      setDisabled(false);
      console.log('Error exporting songs: ', error);
    }
  }

  return (
    <View style={Styles.body}>
      <InfoModal />
      <PageTitle 
        title='Export Music'
        infoHandler={() => setShowInfoModal(true)}
        showList={false}
      />
      <View style={Local.body}>
        <Text style={Local.prompt}>
          Export your edited songs?
        </Text>
        <Text style={Local.info}>
          To learn how to export your songs to Spotify, click the info icon at the top of the page.
        </Text>
        <CustomButton
          title='Export'
          background={theme}
          customStyles={Local.button}
          buttonWidth='40%'
          disabled={disabled}
          handlePress={handleExport}
        />
      </View>
      <ImportControls 
        altTitle='Back'
        mainTitle='Next'
        altHandle={() => setHomeState(importState)}
        mainHandle={() => setHomeState(6)}
        altDisabled={disabled}
        mainDisabled={disabled}
      />
    </View>
  );
}

const Local = StyleSheet.create({
  body: {
    ...Styles.main,
    width: '90%',
    marginBottom: Dimensions.get('screen').height < 700 ? 70 : 50,
  },
  prompt: {
    ...Styles.h3,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  info: {
    ...Styles.p,
    color: Colors.infoText,
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    marginVertical: 10,
  }
});

export default ExportPrompt;
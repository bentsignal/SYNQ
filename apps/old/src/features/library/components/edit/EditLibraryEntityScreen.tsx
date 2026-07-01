import { memo, type ReactNode } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/src/constants/Colors";
import { Styles } from "@/src/constants/Styles";
import { type CoverType } from "@/src/constants/Types";
import EditCover from "@/src/features/cover/components/EditCover";
import Notifications from "@/src/features/notifications/components";
import CustomButton from "@/src/shared/components/CustomButton";
import Bar from "@/src/shared/components/modals/Bar";
import ModalStyles from "@/src/shared/components/modals/Styles";

const MemoTextInput = memo(TextInput);

type EditLibraryEntityScreenProps = {
  children?: ReactNode;
  coverId: number;
  coverImage?: string;
  coverLabel: string;
  coverType: CoverType;
  handleClose: () => void;
  handleUpdateImage: () => void;
  name?: string;
  namePlaceholder: string;
  setName: (name: string) => void;
  setYearFromText?: (year: string) => void;
  title: string;
  validateName: (name: string) => void;
  validateYear?: (year: string) => void;
  year?: number;
  yearLabel?: string;
  yearPlaceholder?: string;
};

export default function EditLibraryEntityScreen({
  children,
  coverId,
  coverImage,
  coverLabel,
  coverType,
  handleClose,
  handleUpdateImage,
  name,
  namePlaceholder,
  setName,
  setYearFromText,
  title,
  validateName,
  validateYear,
  year,
  yearLabel,
  yearPlaceholder,
}: EditLibraryEntityScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={Local.wrapper}>
      <Bar />
      <Text style={ModalStyles.header}>{title}</Text>
      <View style={Styles.divider} />
      <KeyboardAwareScrollView
        style={Local.scrollView}
        contentContainerStyle={Local.scrollViewContent}
      >
        <Text style={Styles.textboxLabel}>{coverLabel}</Text>
        <View style={Local.coverWrapper}>
          <EditCover
            id={coverId}
            image={coverImage}
            type={coverType}
            handlePress={handleUpdateImage}
            propOnLoad={() => {}}
          />
        </View>
        <Text style={Styles.textboxLabel}>Name</Text>
        <MemoTextInput
          style={Local.textBox}
          autoCorrect={true}
          editable
          numberOfLines={1}
          placeholder={namePlaceholder}
          placeholderTextColor={Colors.altDisabled}
          value={name ?? ""}
          onChangeText={setName}
          onEndEditing={(evt) => validateName(evt.nativeEvent.text)}
        />
        {setYearFromText && validateYear ? (
          <>
            <Text style={Styles.textboxLabel}>{yearLabel ?? "Year"}</Text>
            <MemoTextInput
              style={Local.textBox}
              autoCorrect={false}
              editable
              numberOfLines={1}
              keyboardType="numeric"
              placeholder={yearPlaceholder}
              placeholderTextColor={Colors.altDisabled}
              value={year?.toString() ?? ""}
              onChangeText={setYearFromText}
              onEndEditing={(evt) => validateYear(evt.nativeEvent.text)}
            />
          </>
        ) : null}
        {children}
      </KeyboardAwareScrollView>
      <Notifications customStyles={Local.notifications} />
      <View
        style={[Local.bottomButtonsWrapper, { paddingBottom: insets.bottom }]}
      >
        <CustomButton title="Close" handlePress={handleClose} />
      </View>
    </View>
  );
}

const Local = StyleSheet.create({
  wrapper: {
    ...Styles.body,
    backgroundColor: Colors.popup,
    ...ModalStyles.roundedTop,
  },
  scrollView: {
    width: "100%",
    paddingTop: 20,
  },
  scrollViewContent: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  coverWrapper: {
    width: "90%",
    marginBottom: 20,
  },
  bottomButtonsWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    width: "100%",
  },
  textBox: {
    ...Styles.textbox,
    ...Styles.roundedContainer,
    fontSize: 16,
    marginBottom: 20,
    width: "90%",
  },
  notifications: {
    position: "absolute",
    bottom: 100,
  },
});

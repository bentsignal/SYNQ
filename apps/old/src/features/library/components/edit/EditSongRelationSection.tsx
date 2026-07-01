import type { ReactNode } from "react";
import CustomButton from "@/src/shared/components/CustomButton";
import ModalStyles from "@/src/shared/components/modals/Styles";
import { StyleSheet, Text, View } from "react-native";

type EditSongRelationSectionProps = {
  actionTitle: string;
  children: ReactNode;
  emptyLabel: string;
  hasItems: boolean;
  onAction: () => void;
  title: string;
};

const EditSongRelationSection = ({
  actionTitle,
  children,
  emptyLabel,
  hasItems,
  onAction,
  title,
}: EditSongRelationSectionProps) => {
  return (
    <View style={ModalStyles.fieldWrapper}>
      <Text style={ModalStyles.fieldLabel}>{title}</Text>
      <View style={Local.itemsWrapper}>
        {!hasItems && (
          <Text style={ModalStyles.emptyListFiller}>{emptyLabel}</Text>
        )}
        {hasItems && children}
      </View>
      <CustomButton
        title={actionTitle}
        handlePress={onAction}
        buttonWidth={"90%"}
      />
    </View>
  );
};

const Local = StyleSheet.create({
  itemsWrapper: {
    width: "100%",
    marginTop: 20,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
  },
});

export default EditSongRelationSection;

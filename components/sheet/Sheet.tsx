import React, { useState, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import Bar from '../modals/Bar';
import { Styles } from '@/constants/Styles';
import ModalStyles from '@/components/modals/Styles';

type SheetProps = {
  name: string,
  children?: React.ReactNode,
  onChange: (index: number) => void,
}

const Sheet = ({ name, children, onChange}: SheetProps) => {

  return (
    <TrueSheet
      name={name}
      sizes={['50%', 'large']}
      backgroundColor={Colors.popup}
      style={Local.sheetStyle}
      grabber={false}
      contentContainerStyle={Local.contentContainer}
      onSizeChange={(state) => onChange(state.index)}
    >
      <Bar />
      {children}
    </TrueSheet>
  );

}

const Local = StyleSheet.create({
  sheetStyle: {
    ...ModalStyles.roundedTop,
  },
  contentContainer: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 40,
  }
});

export default Sheet;
import React, { useState, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import Bar from '../modals/Bar';

type SheetProps = {
  name: string,
  children?: React.ReactNode,
}

const Sheet = ({ name, children}: SheetProps) => {

  return (
    <TrueSheet
      name={name}
      sizes={['auto', 'large']}
      backgroundColor={Colors.popup}
      style={Local.sheetStyle}
      grabber={false}
      contentContainerStyle={Local.contentContainer}
    >
      <Bar />
      {children}
    </TrueSheet>
  );

}

const Local = StyleSheet.create({
  sheetStyle: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  contentContainer: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 40,
  }
});

export default Sheet;
import React from "react";
import { View } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";

/**
 * This function is used to create a bottom sheet
 * @returns A <RBSheet> component.
 */
export default function BottomSheet({ children, sheetRef, component, height, closeOnDragDown = true, colors, dragFromTopOnly = false }) {

  return (
    <View>
      <RBSheet
        ref={sheetRef}
        closeOnDragDown={closeOnDragDown}
        dragFromTopOnly={dragFromTopOnly}
        animationType="fade"
        openDuration={200}
        height={height}
        closeDuration={200}
        customStyles={{
          container: {
            borderRadius: 6,
            backgroundColor: colors?.background ? colors.background : "#fff",
          },
        }}
      >
            {children}
      </RBSheet>
    </View>
  );
}

// const styles = StyleSheet.create({})

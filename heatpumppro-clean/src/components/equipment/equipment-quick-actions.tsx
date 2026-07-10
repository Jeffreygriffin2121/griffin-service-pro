import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PrimaryButton } from '../primary-button';
import { EquipmentQuickAction } from '../../types/equipment';

type Props = {
  actions: EquipmentQuickAction[];
  onActionPress: (action: EquipmentQuickAction) => void;
};

export function EquipmentQuickActions({ actions, onActionPress }: Props) {
  return (
    <View>
      {actions.map((action) => (
        <PrimaryButton
          key={action.id}
          style={styles.button}
          title={action.label}
          accessibilityLabel={action.label}
          onPress={() => {
            onActionPress(action);
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    marginBottom: 10,
  },
});

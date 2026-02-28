import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';
import { colors } from '@/styles/colors';

export interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface DropdownMenuProps {
  items: MenuItem[];
  /** Distance from top of screen to the dropdown */
  offsetTop: number;
  /** Distance from right of screen to the dropdown */
  offsetRight?: number;
}

export function DropdownMenu({ items, offsetTop, offsetRight = 16 }: DropdownMenuProps) {
  const { isDark } = useTheme();
  const [visible, setVisible] = useState(false);

  const handleItemPress = useCallback((onPress: () => void) => {
    setVisible(false);
    setTimeout(onPress, 100);
  }, []);

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
        style={triggerStyles.button}
      >
        <Ionicons name="ellipsis-vertical" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        {/* Backdrop */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View
            style={[
              styles.dropdown,
              {
                top: offsetTop,
                right: offsetRight,
                backgroundColor: isDark ? colors.secondary[800] : colors.white,
                shadowColor: isDark ? '#000' : '#888',
              },
            ]}
          >
            {items.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleItemPress(item.onPress)}
                activeOpacity={0.6}
                style={[
                  styles.menuItem,
                  index < items.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: isDark ? colors.secondary[700] : colors.divider,
                  },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={item.destructive ? '#EF4444' : isDark ? colors.white : colors['dark-grey']}
                  style={{ marginRight: 10 }}
                />
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '500',
                    color: item.destructive ? '#EF4444' : isDark ? colors.white : colors['dark-grey'],
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const triggerStyles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const styles = StyleSheet.create({
  dropdown: {
    position: 'absolute',
    minWidth: 200,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
});

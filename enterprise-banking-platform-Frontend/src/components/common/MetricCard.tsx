import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'blue' | 'white' | 'dark';
  onPress?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  icon,
  variant = 'white',
  onPress,
}) => {
  const isDark = variant === 'dark';
  const isBlue = variant === 'blue';

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        isDark && styles.cardDark,
        isBlue && styles.cardBlue,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.topRow}>
        <Text style={[styles.label, isDark || isBlue ? styles.textLight : styles.textDark]}>
          {label}
        </Text>
        {icon && (
          <View style={[styles.iconContainer, isDark || isBlue ? styles.iconContainerLight : styles.iconContainerDark]}>
            <Ionicons name={icon} size={18} color={isDark || isBlue ? '#FFFFFF' : Colors.actionBlue} />
          </View>
        )}
      </View>
      <Text style={[styles.value, isDark || isBlue ? styles.textWhite : styles.textPrimary]} numberOfLines={1}>
        {value}
      </Text>
      {subValue ? (
        <Text style={[styles.subValue, isDark || isBlue ? styles.textAccentLight : styles.textSecondary]}>
          {subValue}
        </Text>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#0B1D3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: Colors.primary,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardBlue: {
    backgroundColor: Colors.primaryBlue,
    borderColor: 'transparent',
  },
  pressed: {
    opacity: 0.9,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    marginRight: 6,
  },
  textDark: {
    color: Colors.textSecondary,
  },
  textLight: {
    color: '#D5E3FF',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerDark: {
    backgroundColor: Colors.lightBlue,
  },
  iconContainerLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
  },
  textPrimary: {
    color: Colors.textPrimary,
  },
  textWhite: {
    color: '#FFFFFF',
  },
  subValue: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  textSecondary: {
    color: Colors.textSecondary,
  },
  textAccentLight: {
    color: '#93C5FD',
  },
});

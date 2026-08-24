import React from 'react';
import { View, Text, Pressable, StyleSheet, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  rightLabel?: string;
  variant?: 'light' | 'dark';
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightIcon,
  onRightPress,
  rightLabel,
  variant = 'light',
}) => {
  const isDark = variant === 'dark';

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.header, isDark ? styles.headerDark : styles.headerLight]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? Colors.primary : Colors.surface} />
      <View style={styles.content}>
        {showBack ? (
          <Pressable onPress={handleBack} style={[styles.iconButton, isDark && styles.iconButtonDark]}>
            <Ionicons name="chevron-back" size={22} color={isDark ? '#FFFFFF' : Colors.primary} />
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}

        <View style={styles.titleContainer}>
          <Text style={[styles.title, isDark ? styles.titleDark : styles.titleLight]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, isDark ? styles.subtitleDark : styles.subtitleLight]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {rightIcon || rightLabel ? (
          <Pressable onPress={onRightPress} style={[styles.rightButton, isDark && styles.rightButtonDark]}>
            {rightIcon && <Ionicons name={rightIcon} size={20} color={isDark ? '#FFFFFF' : Colors.actionBlue} />}
            {rightLabel && <Text style={[styles.rightLabelText, isDark && styles.rightLabelDark]}>{rightLabel}</Text>}
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 48,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerLight: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E2E8F0',
  },
  headerDark: {
    backgroundColor: Colors.primary,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  titleLight: {
    color: Colors.textPrimary,
  },
  titleDark: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  subtitleLight: {
    color: Colors.textSecondary,
  },
  subtitleDark: {
    color: '#D5E3FF',
  },
  placeholder: {
    width: 38,
  },
  rightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: Colors.lightBlue,
  },
  rightButtonDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  rightLabelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.actionBlue,
  },
  rightLabelDark: {
    color: '#FFFFFF',
  },
});

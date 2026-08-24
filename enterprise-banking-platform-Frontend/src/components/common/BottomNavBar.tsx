import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

interface TabItem {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  route: string;
}

interface BottomNavBarProps {
  type: 'customer' | 'bank';
}

const CUSTOMER_TABS: TabItem[] = [
  { key: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home', route: '/(customer)/dashboard' },
  { key: 'accounts', label: 'Accounts', icon: 'wallet-outline', activeIcon: 'wallet', route: '/(customer)/accounts' },
  { key: 'transfer', label: 'Transfer', icon: 'swap-horizontal-outline', activeIcon: 'swap-horizontal', route: '/(customer)/fund-transfer' },
  { key: 'history', label: 'History', icon: 'time-outline', activeIcon: 'time', route: '/(customer)/transactions' },
  { key: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person', route: '/(customer)/profile' },
];

const BANK_TABS: TabItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'grid-outline', activeIcon: 'grid', route: '/(bank)/dashboard' },
  { key: 'customers', label: 'Customers', icon: 'people-outline', activeIcon: 'people', route: '/(bank)/customers' },
  { key: 'accounts', label: 'Accounts', icon: 'folder-open-outline', activeIcon: 'folder-open', route: '/(bank)/accounts' },
  { key: 'transactions', label: 'Transactions', icon: 'receipt-outline', activeIcon: 'receipt', route: '/(bank)/transactions' },
  { key: 'more', label: 'More', icon: 'ellipsis-horizontal-circle-outline', activeIcon: 'ellipsis-horizontal-circle', route: '/(bank)/profile' },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ type }) => {
  const pathname = usePathname();
  const tabs = type === 'customer' ? CUSTOMER_TABS : BANK_TABS;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.route) || (tab.key === 'home' && pathname === '/(customer)/dashboard') || (tab.key === 'dashboard' && pathname === '/(bank)/dashboard');

          return (
            <Pressable
              key={tab.key}
              style={styles.tabButton}
              onPress={() => router.push(tab.route as any)}
            >
              <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={22}
                  color={isActive ? Colors.actionBlue : Colors.textSecondary}
                />
              </View>
              <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
    elevation: 10,
    shadowColor: '#0B1D3A',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconContainer: {
    padding: 4,
    borderRadius: 16,
  },
  activeIconContainer: {
    backgroundColor: Colors.lightBlue,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  activeTabLabel: {
    color: Colors.actionBlue,
    fontWeight: '700',
  },
});

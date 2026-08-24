import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface SidebarDrawerProps {
  visible: boolean;
  onClose: () => void;
  user?: {
    name?: string;
    role?: string;
    employeeId?: string;
  };
  onLogout: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  visible,
  onClose,
  user,
  onLogout,
}) => {
  const name = user?.name || '';
  const role = user?.role || '';
  const empId = user?.employeeId || '';

  const initials = name.length >= 2 ? name.slice(0, 2).toUpperCase() : 'B';

  const menuItems = [
    { label: 'Dashboard', icon: 'grid-outline' as const, route: '/(bank)/dashboard' },
    { label: 'Customers', icon: 'people-outline' as const, route: '/(bank)/customers' },
    { label: 'Accounts', icon: 'folder-open-outline' as const, route: '/(bank)/accounts' },
    { label: 'Transactions', icon: 'receipt-outline' as const, route: '/(bank)/transactions' },
    { label: 'Fund Transfer', icon: 'swap-horizontal-outline' as const, route: '/(bank)/fund-transfer' },
    { label: 'Reports', icon: 'bar-chart-outline' as const, route: '/(bank)/reports' },
  ];

  const otherItems = [
    { label: 'Settings', icon: 'settings-outline' as const, route: '/(bank)/profile' },
    { label: 'Help & Support', icon: 'help-circle-outline' as const, route: '/(bank)/profile' },
  ];

  const navigateTo = (route: string) => {
    onClose();
    router.push(route as any);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.drawer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.userTextContainer}>
                {name ? <Text style={styles.userName}>{name}</Text> : null}
                {role ? <Text style={styles.userRole}>{role}</Text> : null}
                {empId ? <Text style={styles.userEmpId}>{empId}</Text> : null}
              </View>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Navigation Items */}
          <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
            {menuItems.map((item, idx) => (
              <Pressable
                key={idx}
                style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                onPress={() => navigateTo(item.route)}
              >
                <Ionicons name={item.icon} size={20} color="#93C5FD" style={styles.menuIcon} />
                <Text style={styles.menuText}>{item.label}</Text>
              </Pressable>
            ))}

            <View style={styles.divider} />
            <Text style={styles.sectionHeader}>OTHER</Text>

            {otherItems.map((item, idx) => (
              <Pressable
                key={idx}
                style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                onPress={() => navigateTo(item.route)}
              >
                <Ionicons name={item.icon} size={20} color="#94A3B8" style={styles.menuIcon} />
                <Text style={styles.menuText}>{item.label}</Text>
              </Pressable>
            ))}

            <Pressable
              style={({ pressed }) => [styles.menuItem, styles.logoutItem, pressed && styles.menuItemPressed]}
              onPress={() => {
                onClose();
                onLogout();
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="#EF4444" style={styles.menuIcon} />
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    flex: 1,
  },
  drawer: {
    width: '80%',
    maxWidth: 320,
    backgroundColor: Colors.primary,
    height: '100%',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.actionBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  userTextContainer: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  userRole: {
    color: '#93C5FD',
    fontSize: 12,
    marginTop: 2,
  },
  userEmpId: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 1,
  },
  closeButton: {
    padding: 4,
  },
  menuList: {
    marginTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  menuItemPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuIcon: {
    marginRight: 14,
  },
  menuText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  sectionHeader: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  logoutItem: {
    marginTop: 16,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },
});

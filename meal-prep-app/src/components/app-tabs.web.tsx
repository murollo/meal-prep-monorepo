import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, useColorScheme, View, StyleSheet, useWindowDimensions } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Colors, MaxContentWidth } from '@/constants/theme';

export default function AppTabs() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <Tabs style={{ flex: 1 }}>
      <TabSlot style={{ flex: 1, paddingBottom: isMobile ? 65 : 0 }} />
      <TabList asChild>
        <CustomTabList isMobile={isMobile}>
          <TabTrigger name="home" href="/" asChild>
            <TabButton isMobile={isMobile} icon="📅">Planejar</TabButton>
          </TabTrigger>
          <TabTrigger name="recipes" href="/recipes" asChild>
            <TabButton isMobile={isMobile} icon="🥗">Receitas</TabButton>
          </TabTrigger>
          <TabTrigger name="shopping-list" href="/shopping-list" asChild>
            <TabButton isMobile={isMobile} icon="🛒">Compras</TabButton>
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton isMobile={isMobile} icon="👤">Perfil</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, isMobile, icon, ...props }: TabTriggerSlotProps & { isMobile?: boolean; icon?: string }) {
  return (
    <Pressable {...props} style={({ pressed }) => [isMobile ? styles.mobileTabButton : { flexShrink: 1 }, pressed && styles.pressed]}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={isMobile ? styles.mobileTabButtonView : styles.tabButtonView}>
        {isMobile && icon && (
          <ThemedText type="small" style={{ fontSize: 16 }}>{icon}</ThemedText>
        )}
        <ThemedText 
          type="small" 
          style={{ fontSize: isMobile ? 10 : 12, marginTop: isMobile ? 2 : 0 }} 
          themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList({ isMobile, ...props }: TabListProps & { isMobile?: boolean }) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  if (isMobile) {
    return (
      <View {...props} style={[styles.mobileTabListContainer, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
        <View style={styles.mobileTabsRow}>
          {props.children}
        </View>
      </View>
    );
  }

  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView type="backgroundElement" style={[styles.innerContainer, { borderColor: colors.border, borderWidth: 1 }]}>
        <ThemedText type="smallBold" style={styles.brandText}>
          MealPrep 🥗
        </ThemedText>

        <View style={styles.tabsRow}>
          {props.children}
        </View>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Desktop Top Bar
  tabListContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  innerContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: MaxContentWidth,
    width: '100%',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  brandText: {
    fontSize: 16,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabButtonView: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  // Mobile Bottom Bar (Native App Style!)
  mobileTabListContainer: {
    position: 'fixed' as any,
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    borderTopWidth: 1,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    height: '100%',
  },
  mobileTabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  mobileTabButtonView: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.7,
  },
});

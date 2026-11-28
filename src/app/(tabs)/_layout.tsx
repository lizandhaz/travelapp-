import { router } from 'expo-router';
import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';

import { TabButton, TABS, useTabBarStyle } from '@/components/TabBar';

// Tabs: Home, Explore, the "+" (Add a trip), Saved, You. Postcards open from the
// paper-plane button on Home; settings from the button on You.
// The <TabTrigger>s must sit directly inside <TabList> here so Expo Router can find them.
export default function TabsLayout() {
  const barStyle = useTabBarStyle();
  return (
    <Tabs style={{ flex: 1 }}>
      <TabSlot style={{ flex: 1 }} />
      <TabList style={barStyle}>
        {TABS.map((t) =>
          t.name === 'add' ? (
            // The "+" isn't a tab: Add a trip slides up over whichever tab you're on, and × brings you back to it.
            <TabButton key={t.name} label={t.label} Icon={t.Icon} primary onPress={() => router.push('/add')} />
          ) : (
            <TabTrigger key={t.name} name={t.name} href={t.href} asChild>
              <TabButton label={t.label} Icon={t.Icon} />
            </TabTrigger>
          ),
        )}
      </TabList>
    </Tabs>
  );
}

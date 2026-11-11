import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';

import { TabButton, TABS, useTabBarStyle } from '@/components/TabBar';
import { unreadPostcardCount } from '@/lib/data';

// Bottom tab bar: Home, Explore, a raised centre Log button, Postcards, You.
// The <TabTrigger>s must sit directly inside <TabList> here so Expo Router can find them.
export default function TabsLayout() {
  const barStyle = useTabBarStyle();
  return (
    <Tabs style={{ flex: 1 }}>
      <TabSlot style={{ flex: 1 }} />
      <TabList style={barStyle}>
        {TABS.map((t) => (
          <TabTrigger key={t.name} name={t.name} href={t.href} asChild>
            <TabButton
              label={t.label}
              Icon={t.Icon}
              primary={t.name === 'log'}
              badge={t.name === 'postcards' ? unreadPostcardCount() : 0}
            />
          </TabTrigger>
        ))}
      </TabList>
    </Tabs>
  );
}

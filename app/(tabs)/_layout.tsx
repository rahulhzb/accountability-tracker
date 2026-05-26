import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { design } from '@/src/design/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: design.color.teal,
        tabBarInactiveTintColor: design.color.muted,
        tabBarStyle: {
          backgroundColor: design.color.card,
          borderTopColor: design.color.border,
          height: 86,
          paddingTop: 8,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          title: 'Challenges',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.3.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="personal"
        options={{
          title: 'Personal',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="checklist" color={color} />,
        }}
      />
    </Tabs>
  );
}

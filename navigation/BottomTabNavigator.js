import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as React from 'react';

import TabBarIcon from '../components/TabBarIcon';
import PhotoSpotsScreen from '../screens/PhotoSpotsScreen';
import WeatherScreen from '../screens/WeatherScreen';
import LinksScreen from '../screens/LinksScreen';

const BottomTab = createBottomTabNavigator();
const INITIAL_ROUTE_NAME = 'Home';

export default function BottomTabNavigator({ navigation, route }) {
  // Set the header title on the parent stack navigator depending on the
  // currently active tab. Learn more in the documentation:
  // https://reactnavigation.org/docs/en/screen-options-resolution.html
  navigation.setOptions({ headerTitle: getHeaderTitle(route) });

  return (
    <BottomTab.Navigator initialRouteName={INITIAL_ROUTE_NAME}>
      <BottomTab.Screen
        name="Photo Spots"
        component={PhotoSpotsScreen}
        options={{
          title: 'Photo Spots',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="ios-aperture" />,
        }}
      />
      <BottomTab.Screen
        name="Weather"
        component={WeatherScreen}
        options={{
          title: 'Weather',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="md-cloud" />,
        }}
      />
      <BottomTab.Screen
        name="Credits"
        component={LinksScreen}
        options={{
          title: 'Credits',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="md-book" />,
        }}
      />
    </BottomTab.Navigator>
  );
}

function getHeaderTitle(route) {
  const routeName = route.state?.routes[route.state.index]?.name ?? INITIAL_ROUTE_NAME;

  switch (routeName) {
    case 'Weather':
      return 'Weather';
    case 'Photo Spots':
      return 'Photo Spots';
  }
}

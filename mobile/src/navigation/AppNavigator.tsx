import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import VehicleListScreen from '../screens/VehicleListScreen';
import VehicleDetailScreen from '../screens/VehicleDetailScreen';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="VehicleList"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 1,
          shadowOpacity: 0.1,
          borderBottomWidth: 1,
          borderBottomColor: '#E2E8F0',
        },
        headerTitleStyle: {
          fontWeight: '800',
          color: '#0F172A',
          fontSize: 18,
        },
        headerTintColor: '#10B981',
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="VehicleList"
        component={VehicleListScreen}
        options={{
          headerShown: false, // Customized inside screen with SafeAreaView
        }}
      />
      <Stack.Screen
        name="VehicleDetail"
        component={VehicleDetailScreen}
        options={({ route }) => ({
          title: route.params.registrationNumber || 'Vehicle Details',
        })}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;

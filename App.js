import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function IceCreamScreen({ navigation }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>IceCream!</Text>
      <Text style={styles.body}>This is the IceCream! tab.</Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('Details')}
      />
    </View>
  );
}

function DetailsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Details</Text>
      <Text style={styles.body}>This screen is pushed onto the IceCream! stack.</Text>
    </View>
  );
}

function CoffeeScreen({ navigation }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Coffee...</Text>
      <Text style={styles.body}>This is the Coffee... tab.</Text>
      <Button
        title="Go to About"
        onPress={() => navigation.navigate('About')}
      />
    </View>
  );
}

function AboutScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>About</Text>
      <Text style={styles.body}>This screen is pushed onto the Coffee... stack.</Text>
    </View>
  );
}

function IceCreamStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="IceCream!" component={IceCreamScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  );
}

function CoffeeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Coffee..." component={CoffeeScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="IceCream" component={IceCreamStack} />
          <Tab.Screen name="Coffee..." component={CoffeeStack} />
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  body: {
    fontSize: 16,
    marginBottom: 16,
  },
});

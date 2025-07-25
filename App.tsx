import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "./WelcomeScreen";
import LoginScreen from "./LoginScreen";
import SignupScreen from "./SignUpScreen";
import HomeScreen from "./HomeScreen";
import ChatScreen from "./ChatScreen";
import Prescription from "./Prescription";
import TestBooking from "./TestBooking";
import ProfileScreen from "./ProfileScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
      />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="TestBooking" component={TestBooking} options={{ headerShown: false }}/>
        <Stack.Screen name="Prescription" component={Prescription} options={{ headerShown: false }}/>
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// WelcomeScreen.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function WelcomeScreen({ navigation }) {
  return (
    <LinearGradient
      colors={["#A2EBF9", "#45C0be", "#004084"]}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.topHalf}>
          <Image
            source={require("./assets/medgod-logo.png")} // Replace with your actual logo image
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>MedGod</Text>
        </View>

        <View style={styles.bottomHalf}>
          <TouchableOpacity style={styles.modernButton} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modernButton} onPress={() => navigation.navigate("Signup")}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topHalf: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 120,
  },
  bottomHalf: {
    flex: 2,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 150, // Added padding to raise the buttons
  },
  logo: {
    width: 220,
    height: 220,
    marginBottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  button: {
    marginVertical: 10,
  },
  modernButton: {
    backgroundColor: "#45C0be",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  logoText: {
    color: "#fff",
    fontSize: 52,
    fontWeight: "bold",
    marginTop: 2,
    paddingBottom: 10,
  },
});
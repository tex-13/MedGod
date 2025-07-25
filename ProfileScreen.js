import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "./firebase";

export default function ProfileScreen({ navigation }) {
  const user = auth.currentUser;
  const userName = user?.email?.split("@")[0] || "User";
  const email = user?.email;

  return (
    <LinearGradient
      colors={["#0c3c60", "#1b5e75"]}
      style={styles.container}
    >
      <BlurView intensity={50} tint="light" style={styles.blur} />

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back-outline" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Profile Box */}
      <View style={styles.profileBox}>
        <Ionicons name="person-circle-outline" size={100} color="#fff" />
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 10,
    borderRadius: 12,
  },
  profileBox: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    borderColor: "rgba(255,255,255,0.3)",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  userName: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "600",
    marginTop: 10,
  },
  email: {
    fontSize: 16,
    color: "#e0e0e0",
    marginTop: 5,
  },
});
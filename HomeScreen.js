import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Image,
  Animated,
  Easing,
  ImageBackground,
} from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

export default function HomeScreen({ navigation }) {
  const user = auth.currentUser;
  const userName = user?.email?.split("@")[0] || "User";

  const glowAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigation.replace("Login");
      })
      .catch((error) => {
        console.log("Logout error:", error);
      });
  };

  const animatedGlowStyle = {
    shadowOpacity: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.8],
    }),
    elevation: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [5, 15],
    }),
    transform: [
      {
        scale: glowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.03],
        }),
      },
    ],
  };

  return (
    <ImageBackground
      source={require("./assets/logo-bg.png")}
      resizeMode="cover"
      style={styles.backgroundImage}
    >
      <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={["#1f8ea7cc", "#45c0becc"]}
          style={styles.container}
        >
          <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate("Profile")}>
            <Ionicons name="person-circle-outline" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.greeting}>Hello {userName}</Text>

          <Pressable
            style={styles.talkButtonContainer}
            onPress={() => navigation.navigate("Chat")}
          >
            <Animated.View
              style={[
                styles.glassCircle,
                animatedGlowStyle,
              ]}
            >
              <Text style={styles.talkButtonText}>Talk to MedGod</Text>
            </Animated.View>
          </Pressable>

          <Text style={styles.tipText}>
            "Did you know? Drinking water can help regulate body temperature and support overall health."
          </Text>
        </LinearGradient>
      </BlurView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  profileButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    padding: 10,
    borderRadius: 12,
  },
  logoutButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    padding: 10,
    borderRadius: 12,
  },
  greeting: {
    fontSize: 28,
    color: "#fff",
    marginBottom: 130,
    fontWeight: "600",
  },
  talkButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  glassCircle: {
    width: 250,
    height: 150,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 10,
      height: 10,
    },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  talkButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  tipText: {
    marginTop: 160,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#f0f0f0",
    fontStyle: "italic",
    textAlign: "center",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});

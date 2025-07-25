import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function TestBooking({ route, navigation }) {
  const { tests = [] } = route.params || {};
  const [selectedTests, setSelectedTests] = useState([]);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  console.log("🧪 TestBooking screen mounted. Tests received:", tests);

  const toggleTest = (test) => {
    if (selectedTests.includes(test)) {
      setSelectedTests(selectedTests.filter((t) => t !== test));
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const confirmBooking = async () => {
    if (selectedTests.length === 0) {
      Alert.alert("No test selected", "Please select at least one test.");
      return;
    }

    setBookingConfirmed(true);
    await AsyncStorage.setItem("testsBooked", "true");
    console.log("✅ Tests booked:", selectedTests);

    if (route.params?.onTestBooked) {
      route.params.onTestBooked();
    }

    setTimeout(() => {
      navigation.goBack();
    }, 1000);
  };

  return (
    <LinearGradient
      colors={["#274472", "#1B263B"]}
      style={styles.container}
    >
      <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </Pressable>
      {!bookingConfirmed ? (
        <View style={{ flex: 0, paddingTop: 100, paddingBottom: 30 }}>
          <FlatList
            contentContainerStyle={{ paddingBottom: 10 }}
            data={tests}
            keyExtractor={(item, index) => item + "-" + index}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => toggleTest(item)}
                style={[
                  styles.testItem,
                  selectedTests.includes(item) && styles.testItemSelected,
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.testText}>{item}</Text>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconText}>+</Text>
                </View>
              </TouchableOpacity>
            )}
          />
          <Pressable
            style={[
              styles.confirmButton,
              selectedTests.length === 0 && styles.confirmButtonDisabled,
            ]}
            onPress={confirmBooking}
            disabled={selectedTests.length === 0}
          >
            <Text style={styles.confirmButtonText}>Confirm Booking</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.confirmationContainer}>
          <Text style={styles.confirmationText}>
            ✅ Your selected tests have been booked. Thank you!
          </Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    padding: 8,
  },
  testItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 8,
    // iOS blur effect can be added with BlurView, but here just semi-transparent
  },
  testItemSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.35)",
  },
  testText: {
    fontSize: 18,
    color: "#fff",
    flexShrink: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    color: "#fff",
    fontSize: 20,
    lineHeight: 20,
    fontWeight: "bold",
  },
  confirmButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  confirmButtonDisabled: {
    backgroundColor: "#7ea8d6",
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  confirmationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  confirmationText: {
    fontSize: 20,
    color: "white",
    textAlign: "center",
  },
});

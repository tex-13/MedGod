import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function Prescription({ route, navigation }) {
  const { meds = [] } = route.params || {};
  const [selectedMeds, setSelectedMeds] = useState([]);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  useEffect(() => {
    const loadBookingStatus = async () => {
      try {
        const booked = await AsyncStorage.getItem("medsBooked");
        setBookingConfirmed(booked === "true");
      } catch (e) {
        console.error("Failed to load booking status", e);
      }
    };

    loadBookingStatus();
  }, []);

  const toggleMed = (med) => {
    if (selectedMeds.includes(med)) {
      setSelectedMeds(selectedMeds.filter((m) => m !== med));
    } else {
      setSelectedMeds([...selectedMeds, med]);
    }
  };

  const confirmBooking = async () => {
    if (selectedMeds.length === 0) {
      Alert.alert(
        "No medicine selected",
        "Please select at least one medicine."
      );
      return;
    }

    await AsyncStorage.setItem("medsBooked", "true");
    setBookingConfirmed(true);
    setSelectedMeds([]); // Clear selected meds after booking

    if (route.params?.onMedBooked) {
      route.params.onMedBooked(true);
    }
    navigation.goBack();
  };

  return (
    <LinearGradient colors={["#007991", "#78ffd6"]} style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      {true ? (
        <>
          <FlatList
            data={meds}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => toggleMed(item)}
                style={[
                  styles.medItem,
                  selectedMeds.includes(item) && styles.medItemSelected,
                ]}
              >
                <View style={styles.itemRow}>
                  <Text style={styles.medText}>{item}</Text>
                  <Text style={styles.selectText}>+</Text>
                </View>
              </TouchableOpacity>
            )}
            ListFooterComponent={() => (
              <TouchableOpacity style={styles.confirmButton} onPress={confirmBooking}>
                <Text style={styles.confirmButtonText}>CONFIRM BOOKING</Text>
              </TouchableOpacity>
            )}
          />
        </>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 100, backgroundColor: "#fff" },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 10,
    borderRadius: 20,
    zIndex: 1,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 20,
  },
  medItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    marginVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  medItemSelected: {
    backgroundColor: "rgba(120, 255, 214, 0.15)",
    borderColor: "rgba(120, 255, 214, 0.8)",
  },
  medText: {
    fontSize: 16,
    flexShrink: 1,
    flex: 1,
    marginRight: 10,
    color: "#fff",
  },
  selectText: {
    fontSize: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    width: 32,
    height: 32,
    textAlign: "center",
    textAlignVertical: "center",
    color: "#fff",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  confirmButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 14,
    borderRadius: 30,
    marginTop: 20,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});

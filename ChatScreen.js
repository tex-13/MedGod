import React, { useState, useEffect, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { OPENAI_API_KEY } from "./secrets";
import { KeyboardAvoidingView, Platform } from "react-native";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { getAuth } from "firebase/auth";
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ChatScreen({ navigation }) {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [testsBooked, setTestsBooked] = useState(false);
  const [medsBooked, setMedsBooked] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const history = await AsyncStorage.getItem(`chatHistory_${userId}`);
        const testsStatus = await AsyncStorage.getItem(`testsBooked_${userId}`);
        const medsStatus = await AsyncStorage.getItem(`medsBooked_${userId}`);

        if (history !== null) {
          setMessages(JSON.parse(history));
        } else {
          setMessages([
            {
              role: "ai",
              text: "👋 Hello! I’m your medical assistant. How can I help you today?",
            },
          ]);
        }

        setTestsBooked(testsStatus === "true");
        setMedsBooked(medsStatus === "true");
      } catch (e) {
        console.error("Failed to load chat history or booking status:", e);
      }
    };

    loadChatHistory();
  }, [userId]);

  useFocusEffect(
    React.useCallback(() => {
      const refreshBookingStatus = async () => {
        const testsStatus = await AsyncStorage.getItem(`testsBooked_${userId}`);
        const medsStatus = await AsyncStorage.getItem(`medsBooked_${userId}`);
        setTestsBooked(testsStatus === "true");
        setMedsBooked(medsStatus === "true");
      };
      refreshBookingStatus();
    }, [userId])
  );

  const lastAIRef = useRef(null);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || lastMessage.role !== "ai") return;

    if (lastAIRef.current === lastMessage.text) {
      return;
    }

    lastAIRef.current = lastMessage.text;

    const lastText = lastMessage.text || "";
    const cleanText = lastText.replace(/\*\*/g, "").trim();
    const hasTests = cleanText.includes("Recommended Tests:");
    const hasMeds = cleanText.includes("Suggested Medicines:");

    console.log("📨 AI Message:", cleanText);
    console.log("🔍 Detected Tests:", hasTests, "| Meds:", hasMeds);
    console.log("🗃️ Booked Flags — Tests:", testsBooked, "| Meds:", medsBooked);

    setShowButtons(false);

    setTimeout(() => {
      if ((hasTests && !testsBooked) || (hasMeds && !medsBooked)) {
        console.log("✅ Showing buttons now");
        setShowButtons(true);
      } else {
        console.log("❌ No buttons shown — already booked or missing sections");
        setShowButtons(false);
      }
    }, 1000);
  }, [messages, testsBooked, medsBooked]);

  const handleTestBooked = async () => {
    setTestsBooked(true);
    await AsyncStorage.setItem(`testsBooked_${userId}`, "true");
  };
  const handleMedBooked = async () => {
    setMedsBooked(true);
    await AsyncStorage.setItem(`medsBooked_${userId}`, "true");
  };

  // ────────────────────────────────────────────────────────────────
  // Send user symptoms → get AI reply
  // ────────────────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => {
      const updated = [...prev, userMsg];
      AsyncStorage.setItem(`chatHistory_${userId}`, JSON.stringify(updated));
      return updated;
    });

    setInput("");

    const prompt = `User described symptoms: "${input}". Give a 1-line diagnosis, followed by:\n\nRecommended Tests:\n- Test 1\n- Test 2\n\nSuggested Medicines:\n- Medicine A\n- Medicine B\nAlways format as clean bullet lists.`;

    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "HTTP-Referer": "https://hospital-ai-app.dev",
            "X-Title": "Hospital-AI-App",
          },
          body: JSON.stringify({
            model: "mistralai/mistral-7b-instruct",
            messages: [
              {
                role: "system",
                content:
                  "You are a medical assistant. When the user describes symptoms, respond with:\n\n1. A short 1-line diagnosis\n2. A list of 2–3 recommended tests under the heading 'Recommended Tests:'\n3. A list of 2–3 suggested medicines under the heading 'Suggested Medicines:'\nFormat everything as clean bullet points, no extra commentary or disclaimers.",
              },
              { role: "user", content: prompt },
            ],
          }),
        }
      );

      const data = await response.json();

      if (!data.choices || !data.choices[0]) {
        console.error("OpenRouter response error:", data);
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: "AI could not process the request. Try again later.",
          },
        ]);
        return;
      }

      const aiReply = {
        role: "ai",
        text: data.choices[0].message.content.trim(),
      };

      // 🛠️ Reset booking flags only after AI has replied
      await AsyncStorage.removeItem(`testsBooked_${userId}`);
      await AsyncStorage.removeItem(`medsBooked_${userId}`);
      setTestsBooked(false);
      setMedsBooked(false);

      setMessages((prev) => {
        const updated = [...prev, aiReply];
        AsyncStorage.setItem(`chatHistory_${userId}`, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error("OpenRouter fetch error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Sorry, something went wrong. Try again later." },
      ]);
    }
  };

  // ────────────────────────────────────────────────────────────────
  // UI
  // ────────────────────────────────────────────────────────────────
  const lastAIMessage =
    messages
      .slice()
      .reverse()
      .find((msg) => msg.role === "ai")?.text || "";

  return (
    <LinearGradient
      colors={["#1CB5E0", "#000046"]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 85 : 5}
      >
        <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 10,
            marginBottom: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate("Home")}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              width: 40,
              height: 40,
              borderRadius: 12,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 3,
              elevation: 4,
            }}
          >
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              await AsyncStorage.removeItem(`testsBooked_${userId}`);
              await AsyncStorage.removeItem(`medsBooked_${userId}`);
              setTestsBooked(false);
              setMedsBooked(false);
              Alert.alert("Bookings Reset", "You can now test booking again.");
            }}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              width: 40,
              height: 40,
              borderRadius: 12,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 3,
              elevation: 4,
            }}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.chatBox}>
          {messages.map((msg, index) => (
            <Text
              key={index}
              style={msg.role === "user" ? styles.user : styles.ai}
            >
              {msg.text}
            </Text>
          ))}
        </ScrollView>

        <View style={styles.buttonGroup}>
          {showButtons && (
            <View style={styles.sideBySideButtons}>
              {!testsBooked && lastAIMessage.includes("Recommended Tests:") && (
                <View style={[{ flex: 1, marginRight: 5 }, styles.pillButton]}>
                  <TouchableOpacity
                    onPress={() => {
                      const testsMatch =
                        lastAIMessage.split("Recommended Tests:")[1]?.split("Suggested Medicines:")[0] || "";
                      const tests = testsMatch
                        .split("\n")
                        .map((line) => line.replace(/^[-•*]\s*/, "").trim())
                        .filter((line) => line.length > 0);
                      navigation.navigate("TestBooking", {
                        tests,
                        onTestBooked: handleTestBooked,
                      });
                    }}
                    style={styles.glassButton}
                  >
                    <Text style={styles.glassButtonText}>Book Tests</Text>
                  </TouchableOpacity>
                </View>
              )}
              {!medsBooked && lastAIMessage.includes("Suggested Medicines:") && (
                <View style={[{ flex: 1, marginLeft: 5 }, styles.pillButton]}>
                  <TouchableOpacity
                    onPress={() => {
                      const medsMatch = lastAIMessage.split("Suggested Medicines:")[1] || "";
                      const meds = medsMatch
                        .split("\n")
                        .map((line) => line.replace(/^[-•*]\s*/, "").trim())
                        .filter((line) => line.length > 0);
                      navigation.navigate("Prescription", {
                        meds,
                        onMedBooked: handleMedBooked,
                      });
                    }}
                    style={styles.glassButton}
                  >
                    <Text style={styles.glassButtonText}>Book Medicines</Text>
                  </TouchableOpacity>
                </View>
              )}
              {testsBooked && medsBooked && (
                <Text style={{ textAlign: "center", marginTop: 10 }}>
                  ✅ Tests and medicines already booked.
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Describe your symptoms…"
            placeholderTextColor="#ccc"
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>Send</Text>
          </TouchableOpacity>
        </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // backgroundColor removed to allow gradient to show
  container: { flex: 1, padding: 10, paddingTop: 40 },
  chatBox: { flex: 1, marginBottom: 10 },
  user: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 10,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    color: "#fff",
  },
  ai: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.11)",
    padding: 10,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    color: "#fff",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
    marginRight: 5,
    color: "#fff", // Make sure input text is visible on gradient
  },
  sendButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonGroup: {
    marginBottom: 20,
  },
  sideBySideButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  pillButton: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  glassButton: {
    backgroundColor: "rgba(0, 123, 255, 0.2)",
    borderColor: "rgba(0, 123, 255, 0.4)",
    borderWidth: 1,
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  glassButtonText: {
    color: "#d0e8ff",
    fontSize: 14,
    fontWeight: "600",
  },
});

import { TouchableOpacity } from "react-native";
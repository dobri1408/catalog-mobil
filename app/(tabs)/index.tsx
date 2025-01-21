import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  Alert,
  TouchableWithoutFeedback,
} from "react-native";
import { WebView } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";

const App = () => {
  const [url, setUrl] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [links, setLinks] = useState([]);

  useEffect(() => {
    const fetchLinksFromSheet = async () => {
      try {
        const response = await fetch(
          "https://docs.google.com/spreadsheets/d/e/2PACX-1vSA5Uh2_cNFTBQYGDbi2Ri_pEVOpfRm9whUJTcGxZieWDYYcOXykWFTvabEST7u1RY6_oPc8nme4tuS/pub?gid=0&single=true&output=csv"
        );
        const csvData = await response.text();

        // Convert CSV to JSON
        const rows = csvData.split("\n");
        const headers = rows.shift().split(",");
        const jsonLinks = rows.map((row) => {
          const values = row.split(",");
          return headers.reduce((acc, header, index) => {
            acc[header.trim()] = values[index].trim();
            return acc;
          }, {});
        });
        console.log(jsonLinks);

        setLinks(jsonLinks);
      } catch (error) {
        console.error("Error fetching links:", error);
      }
    };

    fetchLinksFromSheet();
  }, []);

  useEffect(() => {
    const loadUrl = async () => {
      try {
        const savedUrl = await AsyncStorage.getItem("selectedUrl");
        if (savedUrl) {
          setUrl(savedUrl);
        } else {
          setIsSelecting(true);
        }
      } catch (error) {
        console.error("Error loading saved URL:", error);
        setIsSelecting(true);
      }
    };
    loadUrl();
  }, []);

  const saveUrl = async (selectedUrl) => {
    try {
      await AsyncStorage.setItem("selectedUrl", selectedUrl);
      setUrl(selectedUrl);
    } catch (error) {
      console.error("Error saving URL:", error);
    }
  };

  const resetUrl = async () => {
    try {
      await AsyncStorage.removeItem("selectedUrl");
      setUrl(null);
      setIsSelecting(true);
    } catch (error) {
      console.error("Error resetting URL:", error);
    }
  };

  const handleLongPress = () => {
    Alert.alert(
      "Schimbă instituția",
      "Dorești să schimbi instituția?",
      [
        {
          text: "Anulează",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => resetUrl(),
        },
      ],
      { cancelable: true }
    );
  };

  if (isSelecting) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Selectează instituția:</Text>
        {links.map((link) => (
          <TouchableOpacity
            key={link.id}
            style={styles.linkButton}
            onPress={() => {
              saveUrl(link.url);
              setIsSelecting(false);
            }}
          >
            <Text style={styles.linkText}>{link.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  if (!url) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#009b88" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onLongPress={handleLongPress}>
      <WebView
        source={{ uri: url }}
        startInLoadingState={true}
        originWhitelist={["http://*", "https://*"]}
        renderLoading={() => (
          <ActivityIndicator
            color="#009b88"
            size="large"
            style={styles.loading}
          />
        )}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        style={styles.webview}
      />
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loading: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  linkButton: {
    padding: 10,
    backgroundColor: "#009b88",
    marginBottom: 10,
    borderRadius: 5,
    width: "80%",
    alignItems: "center",
  },
  linkText: {
    color: "#fff",
    fontSize: 16,
  },
  webview: {
    flex: 1,
  },
});

export default App;

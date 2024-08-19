import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { WebView } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";

const App = () => {
  const [loading, setLoading] = useState(true);
  const webviewRef = useRef(null);

  useEffect(() => {
    const backAction = () => {
      if (webviewRef.current) {
        webviewRef.current.goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const onLoadStart = () => {
    setLoading(true);
  };

  const onLoadEnd = () => {
    setLoading(false);
  };

  const saveWebViewState = async (state) => {
    try {
      await AsyncStorage.setItem("webViewState", state);
    } catch (e) {
      console.error("Failed to save the web view state.", e);
    }
  };

  const getWebViewState = async () => {
    try {
      const savedState = await AsyncStorage.getItem("webViewState");
      return savedState || "";
    } catch (e) {
      console.error("Failed to retrieve the web view state.", e);
      return "";
    }
  };

  const onMessage = async (event) => {
    const { data } = event.nativeEvent;
    if (data === "SAVE_STATE") {
      const state = await webviewRef.current.injectJavaScript(
        `(function() {
          return JSON.stringify(document.cookie);
        })();`
      );
      saveWebViewState(state);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webviewRef}
        source={{ uri: "https://catalog-lmtj.ro" }}
        startInLoadingState={true}
        renderLoading={() => (
          <ActivityIndicator
            color="#009b88"
            size="large"
            style={styles.loading}
          />
        )}
        onLoadStart={onLoadStart}
        onLoadEnd={onLoadEnd}
        onMessage={onMessage}
        sharedCookiesEnabled={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
        onShouldStartLoadWithRequest={(request) => {
          // Handling the request URL here
          return true;
        }}
        onNavigationStateChange={(navState) => {
          saveWebViewState(navState.url);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
});

export default App;

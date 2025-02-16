import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState, useRef, useEffect } from "react";
import AuthService from "./services/auth-service";
import PredictionsService from "./services/predictions-service";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import * as MediaLibrary from "expo-media-library";
import { runOnJS } from "react-native-reanimated";
import { Alert } from "react-native";
import Svg, { Circle, CircleProps } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";

export default function Home() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] =
    MediaLibrary.usePermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const progress = useSharedValue(0);

  // Add these constants
  const CIRCLE_LENGTH = 2 * Math.PI * 40; // radius of 40 matches button radius
  const AnimatedCircle = Animated.createAnimatedComponent<CircleProps>(Circle);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCLE_LENGTH * (1 - progress.value),
  }));

  useEffect(() => {
    const requestInitialPermissions = async () => {
      if (!mediaPermission?.granted) {
        const permission = await requestMediaPermission();
        console.log("Initial media permission request result:", permission);
      }
    };

    requestInitialPermissions();
  }, []);

  const handleLogout = async () => {
    await AuthService.logout();
    router.replace("/"); // Navigate to login/landing page
  };

  const handleRecordingStart = async () => {
    progress.value = 0;

    if (!isCameraReady || !cameraRef.current) {
      console.error("Camera is not ready yet");
      return;
    }

    try {
      setIsRecording(true);
      progress.value = withTiming(1, { duration: 60000 }); // Animate to 100% over 60 seconds
      console.log("Starting recording...");
      const video = await cameraRef.current.recordAsync({
        maxDuration: 60,
      });
      console.log("Recording completed:", video);

      if (!video) {
        console.error("No video data received");
        return;
      }

      // Start upload process
      setIsUploading(true);
      try {
        const response = await PredictionsService.predict(video.uri);
        console.log("Video uploaded successfully:", response);
        Alert.alert("Success", "Video uploaded successfully!");
      } catch (error) {
        console.error("Failed to upload video:", error);
        Alert.alert("Error", "Failed to upload video. Please try again.");
      } finally {
        setIsUploading(false);
      }
    } catch (error) {
      console.error("Failed to start recording:", error);
      setIsRecording(false);
      progress.value = withTiming(0); // Reset progress on error
    }
  };

  const handleRecordingStop = async () => {
    progress.value = 0;
    if (isRecording && cameraRef.current) {
      try {
        await cameraRef.current.stopRecording();
        console.log("Recording stopped successfully");
      } catch (error) {
        console.error("Failed to stop recording:", error);
      }
      setIsRecording(false);
      progress.value = withTiming(0); // Reset progress when stopping
    }
  };

  // Modified gesture to continue recording even when moving finger
  const anywherePress = Gesture.Pan()
    .onBegin(() => {
      runOnJS(handleRecordingStart)();
    })
    .onFinalize(() => {
      runOnJS(handleRecordingStop)();
    });

  if (!permission) {
    console.log("Camera permissions still loading");
    return <View />;
  }

  // if (!permission.granted) {
  //   console.log("Requesting camera permission");
  //   return (
  //     <View style={styles.container}>
  //       <Text style={styles.message}>
  //         We need your permission to show the camera
  //       </Text>
  //       <TouchableOpacity
  //         style={styles.button}
  //         onPress={async () => {
  //           console.log("Camera permission button pressed");
  //           const result = await requestPermission();
  //           console.log("Camera permission result:", result);
  //         }}
  //       >
  //         <Text>Grant Permission</Text>
  //       </TouchableOpacity>
  //     </View>
  //   );
  // }

  // if (!mediaPermission?.granted) {
  //   console.log("Requesting media permission");
  //   return (
  //     <View style={styles.container}>
  //       <Text style={styles.message}>
  //         We need your permission to save videos to your library
  //       </Text>
  //       <TouchableOpacity
  //         style={styles.button}
  //         onPress={async () => {
  //           try {
  //             console.log("Media permission button pressed");
  //             const result = await MediaLibrary.requestPermissionsAsync();
  //             console.log("Media permission result:", result);
  //           } catch (error) {
  //             console.error("Error requesting media permission:", error);
  //           }
  //         }}
  //       >
  //         <Text>Grant Permission</Text>
  //       </TouchableOpacity>
  //     </View>
  //   );
  // }

  // Loading overlay component
  const LoadingOverlay = () => (
    <View style={styles.loadingOverlay}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Uploading video...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        mode="video"
        mute
        onCameraReady={() => {
          console.log("Camera is ready");
          setIsCameraReady(true);
        }}
        onMountError={(error) => {
          console.error("Camera mount error:", error);
          setIsCameraReady(false);
        }}
      >
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isUploading}
        >
          <Ionicons name="exit-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.debugButton}
          onPress={() => (progress.value = withTiming(1, { duration: 60000 }))}
          disabled={isUploading}
        >
          <Ionicons name="exit-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/history")}
            disabled={isUploading}
          >
            <Ionicons name="time-outline" size={32} color="#007AFF" />
          </TouchableOpacity>

          <GestureDetector gesture={anywherePress}>
            <View style={styles.recordButtonContainer}>
              {isRecording && (
                <Svg style={styles.progressCircle} viewBox="0 0 80 80">
                  <Circle
                    cx="40"
                    cy="40"
                    r="30"
                    stroke="#000000"
                    strokeWidth="4"
                    strokeOpacity={0.3}
                    fill="none"
                  />
                  <AnimatedCircle
                    cx="40"
                    cy="40"
                    r="30"
                    stroke="#FFFFFF"
                    strokeWidth="4"
                    strokeDasharray={`${CIRCLE_LENGTH} ${CIRCLE_LENGTH}`}
                    animatedProps={animatedProps}
                    strokeLinecap="round"
                    fill="none"
                  />
                </Svg>
              )}
              <TouchableOpacity
                style={[styles.button, isRecording && styles.recordingButton]}
                disabled={isUploading}
              >
                <Ionicons
                  name="videocam-outline"
                  size={32}
                  color={isRecording ? "#FF3B30" : "#007AFF"}
                />
              </TouchableOpacity>
            </View>
          </GestureDetector>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              setFacing((current) => (current === "back" ? "front" : "back"))
            }
            disabled={isUploading}
          >
            <Ionicons name="repeat-outline" size={32} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </CameraView>
      {isUploading && <LoadingOverlay />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    height: 180,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingVertical: 20,
  },
  button: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  message: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  logoutButton: {
    position: "absolute",
    top: 30,
    right: 20,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  debugButton: {
    position: "absolute",
    top: 70,
    left: 20,
    width: 50,
    height: 50,
  },
  recordingButton: {
    backgroundColor: "#FF3B30",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
  },
  progressCircle: {
    zIndex: 1000,
    position: "absolute",
    width: 100,
    height: 100,
    transform: [{ rotateZ: "-90deg" }],
    left: 0,
    top: 0,
  },
  recordButtonContainer: {
    padding: 10,
    margin: -10,
  },
});

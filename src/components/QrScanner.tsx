import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, Modal } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useTheme } from "@/theme/ThemeProvider";
import { BeepButton } from "@/components/BeepButton";
import { isValidBeepId } from "@/services/authService";

interface QrScannerProps {
  visible: boolean;
  onClose: () => void;
  onScan: (beepId: string) => void;
}

export function QrScanner({ visible, onClose, onScan }: QrScannerProps) {
  const theme = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    // beepget://add/12345678 or plain 8-digit
    const match = data.match(/beepget:\/\/add\/(\d{8})/) || data.match(/^(\d{8})$/);
    if (match && isValidBeepId(match[1])) {
      setScanned(true);
      onScan(match[1]);
      onClose();
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
      gap: theme.spacing.md,
    },
    text: {
      fontFamily: theme.fonts.lcd,
      fontSize: 18,
      color: theme.colors.textPrimary,
    },
    overlay: {
      position: "absolute",
      bottom: 60,
      left: 0,
      right: 0,
      alignItems: "center",
    },
  }), [theme]);

  if (!permission?.granted) {
    return (
      <Modal visible={visible} onRequestClose={onClose}>
        <View style={styles.center}>
          <Text style={styles.text}>카메라 권한이 필요합니다</Text>
          <BeepButton title="권한 허용" onPress={requestPermission} />
          <BeepButton title="닫기" onPress={onClose} variant="secondary" />
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} onRequestClose={onClose}>
      <CameraView
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      <View style={styles.overlay}>
        <BeepButton title="닫기" onPress={onClose} variant="danger" />
      </View>
    </Modal>
  );
}

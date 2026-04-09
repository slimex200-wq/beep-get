import React, { useEffect, useState, useMemo } from "react";
import { View, Text, FlatList, StyleSheet, TextInput, Alert } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { BeepButton } from "@/components/BeepButton";
import { QrScanner } from "@/components/QrScanner";
import { useAuthStore } from "@/stores/authStore";
import { useFriendStore } from "@/stores/friendStore";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootNavigator";

export function FriendsScreen() {
  const theme = useTheme();
  const { profile } = useAuthStore();
  const { friends, loading, fetch, add } = useFriendStore();
  const [beepIdInput, setBeepIdInput] = useState("");
  const [showQr, setShowQr] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (profile) fetch(profile.id);
  }, [profile?.id]);

  const handleAdd = async () => {
    if (!profile || !beepIdInput) return;
    try {
      await add(profile.id, beepIdInput);
      setBeepIdInput("");
      Alert.alert("친구 추가 완료");
    } catch (err: any) {
      Alert.alert("오류", err.message);
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
    },
    header: {
      fontFamily: theme.fonts.pixel,
      fontSize: 14,
      color: theme.colors.textSecondary,
      letterSpacing: 2,
      textAlign: "center",
      marginBottom: theme.spacing.md,
      marginTop: theme.spacing.xl,
    },
    addRow: {
      flexDirection: "row",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    input: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.sm,
      fontFamily: theme.fonts.lcd,
      fontSize: 18,
      color: theme.colors.textPrimary,
      textAlign: "center",
      letterSpacing: 2,
    },
    friendItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    friendInfo: { flex: 1 },
    friendName: {
      fontFamily: theme.fonts.lcd,
      fontSize: 18,
      color: theme.colors.textPrimary,
    },
    friendBeepId: {
      fontFamily: theme.fonts.mono,
      fontSize: 11,
      color: theme.colors.textSecondary,
    },
  }), [theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>FRIENDS</Text>
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          value={beepIdInput}
          onChangeText={setBeepIdInput}
          placeholder="삐삐 번호 8자리"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="number-pad"
          maxLength={8}
        />
        <BeepButton title="추가" onPress={handleAdd} />
      </View>
      <BeepButton title="QR 스캔" onPress={() => setShowQr(true)} variant="secondary" />
      <QrScanner
        visible={showQr}
        onClose={() => setShowQr(false)}
        onScan={async (beepId) => {
          if (profile) {
            try {
              await add(profile.id, beepId);
              Alert.alert("QR로 친구 추가 완료");
            } catch (err: any) {
              Alert.alert("오류", err.message);
            }
          }
        }}
      />
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.friendItem}>
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>
                {item.nickname || item.friend.nickname}
              </Text>
              <Text style={styles.friendBeepId}>{item.friend.beep_id}</Text>
            </View>
            <BeepButton
              title="신호"
              onPress={() =>
                navigation.navigate("Send", {
                  friendId: item.friend_id,
                  friendName: item.nickname || item.friend.nickname,
                })
              }
              variant="secondary"
            />
          </View>
        )}
      />
    </View>
  );
}

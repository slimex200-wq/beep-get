import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { neumorphism as theme } from "@/theme/neumorphism";
import { CodeInput } from "@/components/CodeInput";
import { BeepButton } from "@/components/BeepButton";
import { useMessageStore } from "@/stores/messageStore";
import { useAuthStore } from "@/stores/authStore";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Send">;

export function SendScreen({ route, navigation }: Props) {
  const { friendId, friendName } = route.params;
  const { profile } = useAuthStore();
  const { send } = useMessageStore();
  const [code, setCode] = useState("");
  const [memo, setMemo] = useState("");

  const handleSend = async () => {
    if (!profile || !code) return;
    try {
      await send(profile.id, friendId, code, memo || undefined);
      Alert.alert("전송 완료", `${friendName}에게 ${code} 전송`);
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("전송 실패", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.to}>TO: {friendName}</Text>
      <CodeInput value={code} onChangeText={setCode} label="숫자 코드" />
      <CodeInput
        value={memo}
        onChangeText={setMemo}
        label="메모 (선택)"
        placeholder="짧은 메모"
        maxLength={30}
      />
      <BeepButton title="전송" onPress={handleSend} disabled={!code} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  to: {
    fontFamily: theme.fonts.lcd,
    fontSize: 20,
    color: theme.colors.primary,
    textAlign: "center",
    marginTop: theme.spacing.xl,
  },
});

import { StyleSheet, Text, View } from "react-native";

export default function HomeVet() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>HomeVet (placeholder)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1b2a",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
});

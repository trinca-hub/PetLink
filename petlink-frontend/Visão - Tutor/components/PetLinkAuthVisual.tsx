import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";

type PetLinkAuthHeaderProps = {
  title?: string;
  subtitle?: string;
};

export function PetLinkAuthBackdrop() {
  return (
    <View pointerEvents="none" style={styles.backdrop}>
      <Ionicons name="paw-outline" size={94} color="rgba(255,255,255,0.035)" style={[styles.decor, styles.pawTop]} />
      <Ionicons name="heart-outline" size={44} color="rgba(255,255,255,0.06)" style={[styles.decor, styles.heart]} />
      <MaterialCommunityIcons name="dog-side" size={72} color="rgba(255,255,255,0.05)" style={[styles.decor, styles.dog]} />
      <MaterialCommunityIcons name="cat" size={68} color="rgba(255,255,255,0.055)" style={[styles.decor, styles.cat]} />
      <Ionicons name="bone-outline" size={72} color="rgba(47,124,246,0.16)" style={[styles.decor, styles.bone]} />
      <View style={[styles.glow, styles.glowTop]} />
      <View style={[styles.glow, styles.glowBottom]} />
    </View>
  );
}

export function PetLinkAuthHeader({ title, subtitle }: PetLinkAuthHeaderProps) {
  return (
    <View style={styles.header}>
      <Image source={require("../assets/images/petlink-logo.png")} resizeMode="contain" style={styles.logo} />
      {!!title && <Text style={styles.title}>{title}</Text>}
      <Text style={styles.tagline}>{subtitle || "Cuidando de você e do seu pet da forma certa!"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, overflow: "hidden" },
  decor: { position: "absolute" },
  pawTop: { top: 46, right: -14, transform: [{ rotate: "22deg" }] },
  heart: { top: 200, left: 34, transform: [{ rotate: "-18deg" }] },
  dog: { top: 128, left: 18, transform: [{ rotate: "-12deg" }] },
  cat: { top: 295, right: 24, transform: [{ rotate: "14deg" }] },
  bone: { bottom: 105, right: 7, transform: [{ rotate: "-28deg" }] },
  glow: { position: "absolute", width: 280, height: 280, borderRadius: 280, backgroundColor: "rgba(30,96,210,0.13)" },
  glowTop: { top: -170, right: -105 },
  glowBottom: { bottom: -190, left: -135 },
  header: { alignItems: "center", paddingTop: 16, marginBottom: 26 },
  logo: { width: 286, height: 104 },
  title: { marginTop: 4, color: "#fff", fontSize: 20, fontWeight: "800" },
  tagline: { marginTop: 8, maxWidth: 290, color: "rgba(255,255,255,0.86)", fontSize: 15, lineHeight: 21, fontWeight: "600", textAlign: "center" },
});

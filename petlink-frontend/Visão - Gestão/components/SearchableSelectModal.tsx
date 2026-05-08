import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export type SelectOption = {
  value: string;
  label: string;
  subtitle?: string;
};

type SearchableSelectModalProps = {
  visible: boolean;
  title: string;
  options: SelectOption[];
  onClose: () => void;
  onSelect: (option: SelectOption) => void;
};

export default function SearchableSelectModal({
  visible,
  title,
  options,
  onClose,
  onSelect,
}: SearchableSelectModalProps) {
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return options;

    return options.filter((option) => {
      const target = `${option.label} ${option.subtitle || ""}`.toLowerCase();
      return target.includes(query);
    });
  }, [options, search]);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={18} color="#dbe9ff" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Buscar..."
            placeholderTextColor="#98abc9"
            value={search}
            onChangeText={setSearch}
          />

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {filteredOptions.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum resultado encontrado.</Text>
            ) : (
              filteredOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.optionButton}
                  onPress={() => {
                    onSelect(option);
                    setSearch("");
                    onClose();
                  }}
                >
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  {!!option.subtitle && <Text style={styles.optionSubtitle}>{option.subtitle}</Text>}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: 18,
  },
  card: {
    width: "100%",
    maxWidth: 560,
    maxHeight: "80%",
    alignSelf: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.30)",
    backgroundColor: "#0f253e",
    padding: 14,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: "#edf4ff",
    fontSize: 17,
    fontWeight: "700",
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.30)",
    backgroundColor: "rgba(20, 56, 99, 0.35)",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.25)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#eaf2ff",
    backgroundColor: "rgba(20, 56, 99, 0.45)",
  },
  list: {
    maxHeight: 420,
  },
  listContent: {
    gap: 8,
    paddingBottom: 4,
  },
  emptyText: {
    color: "#b7c8e8",
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 16,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.25)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "rgba(20, 56, 99, 0.45)",
  },
  optionLabel: {
    color: "#edf4ff",
    fontSize: 14,
    fontWeight: "700",
  },
  optionSubtitle: {
    color: "#b7c8e8",
    fontSize: 12,
    marginTop: 2,
  },
});

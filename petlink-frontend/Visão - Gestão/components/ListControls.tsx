import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export type ListOption = {
  label: string;
  value: string;
};

export type SortDirection = "none" | "asc" | "desc";

export type SortState = {
  field: string;
  direction: SortDirection;
};

export type SortField = ListOption & {
  type: "text" | "number" | "date";
};

export type FilterGroup = {
  label: string;
  value: string;
  options: ListOption[];
  onChange: (value: string) => void;
};

export type TextFilter = {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

type ListControlsProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  sort: SortState;
  sortFields: SortField[];
  onSortChange: (value: SortState) => void;
  filters?: FilterGroup[];
  textFilters?: TextFilter[];
  resultCount: number;
  totalCount: number;
};

function nextSortDirection(current: SortDirection, type: SortField["type"]) {
  if (type === "number" || type === "date") {
    if (current === "none") return "desc";
    if (current === "desc") return "asc";
    return "none";
  }

  if (current === "none") return "asc";
  if (current === "asc") return "desc";
  return "none";
}

function getSortIcon(direction: SortDirection, type: SortField["type"]) {
  if (direction === "none") return "swap-vertical-outline";
  if (type === "number" || type === "date") {
    return direction === "desc" ? "arrow-down-outline" : "arrow-up-outline";
  }

  return direction === "asc" ? "arrow-down-outline" : "arrow-up-outline";
}

export default function ListControls({
  search,
  onSearchChange,
  searchPlaceholder = "Buscar",
  sort,
  sortFields,
  onSortChange,
  filters = [],
  textFilters = [],
  resultCount,
  totalCount,
}: ListControlsProps) {
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = useMemo(() => {
    const selectCount = filters.filter((filter) => filter.value !== "todos").length;
    const textCount = textFilters.filter((filter) => !!filter.value.trim()).length;
    return selectCount + textCount;
  }, [filters, textFilters]);

  function cycleSort(field: SortField) {
    const isCurrentField = sort.field === field.value;
    const currentDirection = isCurrentField ? sort.direction : "none";
    const direction = nextSortDirection(currentDirection, field.type);

    onSortChange({
      field: direction === "none" ? "" : field.value,
      direction,
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color="#9fc0f6" />
          <TextInput
            style={styles.searchInput}
            placeholder={searchPlaceholder}
            placeholderTextColor="#98abc9"
            value={search}
            onChangeText={onSearchChange}
          />
          {!!search && (
            <TouchableOpacity onPress={() => onSearchChange("")}>
              <Ionicons name="close-circle-outline" size={17} color="#9fc0f6" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters((value) => !value)}
        >
          <Ionicons name="filter-outline" size={17} color="#dbe9ff" />
          {activeFilterCount > 0 && <Text style={styles.filterCount}>{activeFilterCount}</Text>}
        </TouchableOpacity>

        <Text style={styles.counter}>{resultCount}/{totalCount}</Text>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupLabel}>Ordenar</Text>
        <View style={styles.chips}>
          {sortFields.map((field) => {
            const isActive = sort.field === field.value && sort.direction !== "none";
            const direction = isActive ? sort.direction : "none";

            return (
              <TouchableOpacity
                key={field.value}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => cycleSort(field)}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{field.label}</Text>
                <Ionicons
                  name={getSortIcon(direction, field.type)}
                  size={14}
                  color={isActive ? "#fff" : "#9fc0f6"}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {showFilters && (
        <View style={styles.filterPanel}>
          {textFilters.map((filter) => (
            <View key={filter.label} style={styles.group}>
              <Text style={styles.groupLabel}>{filter.label}</Text>
              <View style={styles.filterInputBox}>
                <TextInput
                  style={styles.searchInput}
                  placeholder={filter.placeholder}
                  placeholderTextColor="#98abc9"
                  value={filter.value}
                  onChangeText={filter.onChange}
                />
                {!!filter.value && (
                  <TouchableOpacity onPress={() => filter.onChange("")}>
                    <Ionicons name="close-circle-outline" size={17} color="#9fc0f6" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          {filters.map((filter) => (
            <View key={filter.label} style={styles.group}>
              <Text style={styles.groupLabel}>{filter.label}</Text>
              <View style={styles.chips}>
                {filter.options.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.chip, filter.value === option.value && styles.chipActive]}
                    onPress={() => filter.onChange(option.value)}
                  >
                    <Text style={[styles.chipText, filter.value === option.value && styles.chipTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.20)",
    backgroundColor: "rgba(13, 32, 53, 0.78)",
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  searchBox: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.25)",
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: "rgba(20, 56, 99, 0.45)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: { flex: 1, color: "#eaf2ff", fontSize: 13, paddingVertical: 9 },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.25)",
    backgroundColor: "rgba(20, 56, 99, 0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonActive: { backgroundColor: "#1d67e0", borderColor: "rgba(153, 196, 255, 0.65)" },
  filterCount: {
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: "#34a873",
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 17,
  },
  counter: { color: "#b7c8e8", fontSize: 12, fontWeight: "700" },
  filterPanel: { gap: 10, borderTopWidth: 1, borderTopColor: "rgba(138,180,248,0.16)", paddingTop: 10 },
  group: { gap: 6 },
  groupLabel: { color: "#9fc0f6", fontSize: 11, fontWeight: "700" },
  filterInputBox: {
    minHeight: 38,
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.22)",
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: "rgba(20, 56, 99, 0.35)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.24)",
    backgroundColor: "rgba(20, 56, 99, 0.35)",
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipActive: {
    backgroundColor: "#1d67e0",
    borderColor: "rgba(153, 196, 255, 0.65)",
  },
  chipText: { color: "#cddcf5", fontSize: 12, fontWeight: "700" },
  chipTextActive: { color: "#fff" },
});

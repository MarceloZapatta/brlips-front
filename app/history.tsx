import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import predictionsService from "./services/predictions-service";

interface Prediction {
  id: string;
  text: string;
  created_at: string;
}

export default function History() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPredictions = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      setError(null);
      const response = await predictionsService.getPredictions(page);
      const newPredictions = response.predictions;

      if (newPredictions.length === 0) {
        setHasMore(false);
      } else {
        setPredictions((prev) => [...prev, ...newPredictions]);
        if (response.next_page === page) {
          setHasMore(false);
        } else {
          setPage((prev) => prev + 1);
        }
      }
    } catch (err) {
      setError("Failed to load predictions");
      console.error("Error fetching predictions:", err);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  const renderItem = ({ item }: { item: Prediction }) => (
    <View style={styles.predictionItem}>
      <Text style={styles.predictionText}>{item.text}</Text>
      <Text style={styles.dateText}>
        {new Date(item.created_at).toLocaleDateString()}{" "}
        {new Date(item.created_at).toLocaleTimeString()}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={predictions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onEndReached={fetchPredictions}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={() =>
          !loading && (
            <View style={styles.centerContainer}>
              <Text>No predictions found</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    padding: 16,
    textAlign: "center",
  },
  predictionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  predictionText: {
    fontSize: 16,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: "#666",
  },
  footer: {
    padding: 16,
    alignItems: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
});

import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GAMES } from "../../constants/games";

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎮 GameGram</Text>

      {GAMES.map((game, index) => (
        <TouchableOpacity
          key={index}
          style={styles.card}
          onPress={() => router.push(game.route as any)}
        >
          <Text style={styles.icon}>{game.icon}</Text>
          <Text style={styles.text}>{game.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 30,
    marginBottom: 30,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#4f46e5",
    width: 250,
    padding: 20,
    borderRadius: 16,
    marginVertical: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  icon: {
    fontSize: 22,
    marginRight: 10,
  },
  text: {
    color: "#fff",
    fontSize: 18,
  },
});

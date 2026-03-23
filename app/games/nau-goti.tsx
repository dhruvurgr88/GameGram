import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import Board from "../../components/nauGoti/Board";
import {
  adjacency,
  canRemovePiece,
  isPieceInMill,
} from "../../components/nauGoti/logic";

export default function NauGoti() {
  const [board, setBoard] = useState<(string | null)[]>(Array(24).fill(null));
  const [player, setPlayer] = useState<"P1" | "P2">("P1");
  const [phase, setPhase] = useState<"placing" | "moving">("placing");
  const [toPlace, setToPlace] = useState({ P1: 9, P2: 9 });
  const [capturedBy, setCapturedBy] = useState({ P1: 0, P2: 0 });
  const [selected, setSelected] = useState<number | null>(null);
  const [removeMode, setRemoveMode] = useState(false);

  const opponent = player === "P1" ? "P2" : "P1";

  const handlePress = (i: number) => {
    if (removeMode) {
      if (canRemovePiece(board, i, opponent)) {
        const newBoard = [...board];
        newBoard[i] = null;
        setBoard(newBoard);
        setCapturedBy((prev) => ({ ...prev, [player]: prev[player] + 1 }));
        setRemoveMode(false);
        setPlayer(opponent);
      } else {
        Alert.alert("Protected", "This goti is in a straight line!");
      }
      return;
    }

    if (phase === "placing") {
      if (board[i]) return;
      const newBoard = [...board];
      newBoard[i] = player;
      setBoard(newBoard);
      const newToPlace = { ...toPlace, [player]: toPlace[player] - 1 };
      setToPlace(newToPlace);

      if (isPieceInMill(newBoard, i)) {
        setRemoveMode(true);
      } else {
        if (newToPlace.P1 === 0 && newToPlace.P2 === 0) setPhase("moving");
        setPlayer(opponent);
      }
    } else {
      if (selected === null) {
        if (board[i] === player) setSelected(i);
      } else {
        if (adjacency[selected].includes(i) && !board[i]) {
          const newBoard = [...board];
          newBoard[selected] = null;
          newBoard[i] = player;
          setBoard(newBoard);
          if (isPieceInMill(newBoard, i)) setRemoveMode(true);
          else setPlayer(opponent);
        }
        setSelected(null);
      }
    }
  };

  const renderInventory = (p: "P1" | "P2") => (
    <View style={styles.inventoryRow}>
      {Array.from({ length: toPlace[p] }).map((_, idx) => (
        <View
          key={idx}
          style={[
            styles.goti,
            { backgroundColor: p === "P1" ? "#ef4444" : "#3b82f6" },
          ]}
        />
      ))}
    </View>
  );

  const renderCaptured = (p: "P1" | "P2") => (
    <View style={styles.capturedColumn}>
      <Text style={styles.capturedText}>OUT</Text>
      {Array.from({ length: capturedBy[p] }).map((_, idx) => (
        <View
          key={idx}
          style={[
            styles.miniGoti,
            { backgroundColor: p === "P1" ? "#3b82f6" : "#ef4444" },
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* P2 Area (Top) */}
      <View style={styles.playerSection}>
        <Text style={[styles.playerLabel, { color: "#3b82f6" }]}>
          PLAYER 2 (BLUE)
        </Text>
        {renderInventory("P2")}
      </View>

      {/* Main Game Table */}
      <View style={styles.gameTable}>
        {renderCaptured("P2")}
        <View style={styles.boardContainer}>
          <Text style={styles.statusText}>
            {removeMode ? "⚡ REMOVE ENEMY" : `${player}'S TURN`}
          </Text>
          <Board board={board} onPress={handlePress} selected={selected} />
          <Text style={styles.phaseText}>{phase.toUpperCase()} PHASE</Text>
        </View>
        {renderCaptured("P1")}
      </View>

      {/* P1 Area (Bottom) */}
      <View style={styles.playerSection}>
        {renderInventory("P1")}
        <Text style={[styles.playerLabel, { color: "#ef4444" }]}>
          PLAYER 1 (RED)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingVertical: 40,
    justifyContent: "space-between",
  },
  playerSection: {
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#0f172a",
    marginHorizontal: 20,
    borderRadius: 15,
  },
  playerLabel: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2,
    marginVertical: 8,
  },
  inventoryRow: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    height: 30,
    alignItems: "center",
  },
  goti: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  gameTable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  boardContainer: {
    alignItems: "center",
    backgroundColor: "#1e293b",
    padding: 15,
    borderRadius: 20,
    elevation: 20,
  },
  capturedColumn: { width: 40, alignItems: "center", gap: 5 },
  capturedText: {
    color: "#475569",
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
  },
  miniGoti: {
    width: 16,
    height: 16,
    borderRadius: 8,
    opacity: 0.6,
    borderWidth: 1,
    borderColor: "#fff",
  },
  statusText: {
    color: "#fbbf24",
    fontWeight: "bold",
    marginBottom: 15,
    fontSize: 16,
  },
  phaseText: {
    color: "#64748b",
    fontSize: 10,
    marginTop: 10,
    fontWeight: "bold",
  },
});

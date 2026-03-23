import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import { AnimatePresence, MotiView } from "moti";
import React, { useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Board from "../../components/nauGoti/Board";
import {
  adjacency,
  canRemovePiece,
  isPieceInMill,
  mills,
} from "../../components/nauGoti/logic";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

export default function NauGoti() {
  const router = useRouter();
  const [board, setBoard] = useState<(string | null)[]>(Array(24).fill(null));
  const [player, setPlayer] = useState<"P1" | "P2" | null>(null);
  const [phase, setPhase] = useState<"placing" | "moving">("placing");
  const [toPlace, setToPlace] = useState({ P1: 9, P2: 9 });
  const [capturedBy, setCapturedBy] = useState({ P1: 0, P2: 0 });
  const [selected, setSelected] = useState<number | null>(null);
  const [removeMode, setRemoveMode] = useState(false);
  const [activeMills, setActiveMills] = useState<number[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [isTossing, setIsTossing] = useState(true);
  const [tossResult, setTossResult] = useState<"P1" | "P2" | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const opponent = player === "P1" ? "P2" : "P1";

  useEffect(() => {
    runToss();
    const backAction = () => {
      setShowExitConfirm(true);
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );
    return () => backHandler.remove();
  }, []);

  const runToss = () => {
    setIsTossing(true);
    setTossResult(null);
    setPlayer(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setTimeout(() => {
      const winner = Math.random() > 0.5 ? "P1" : "P2";
      setTossResult(winner);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        setPlayer(winner);
        setIsTossing(false);
        startTimer();
      }, 1200);
    }, 2000);
  };

  const triggerFeedback = (
    type: "place" | "remove" | "mill" | "error" | "turn",
  ) => {
    switch (type) {
      case "place":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case "remove":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case "mill":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case "error":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case "turn":
        Haptics.selectionAsync();
        break;
    }
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(30);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? (handleTimeout(), 0) : prev - 1));
    }, 1000);
  };

  const handleTimeout = () => {
    triggerFeedback("error");
    if (removeMode) {
      setRemoveMode(false);
      changeTurn();
    } else {
      setSelected(null);
      changeTurn();
    }
  };

  const changeTurn = () => {
    setPlayer((p) => (p === "P1" ? "P2" : "P1"));
    triggerFeedback("turn");
  };

  useEffect(() => {
    if (
      !winner &&
      !isTossing &&
      player &&
      !showExitConfirm &&
      !showRestartConfirm
    )
      startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [
    player,
    removeMode,
    winner,
    isTossing,
    showExitConfirm,
    showRestartConfirm,
  ]);

  useEffect(() => {
    const currentActiveMills: number[] = [];
    mills.forEach((combo) => {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c])
        currentActiveMills.push(a, b, c);
    });
    setActiveMills([...new Set(currentActiveMills)]);
  }, [board]);

  const handlePress = (i: number) => {
    if (isTossing || !player || showExitConfirm || showRestartConfirm) return;
    if (removeMode) {
      if (canRemovePiece(board, i, opponent)) {
        const newBoard = [...board];
        newBoard[i] = null;
        setBoard(newBoard);
        setCapturedBy((prev) => ({ ...prev, [player]: prev[player] + 1 }));
        setRemoveMode(false);
        triggerFeedback("remove");
        if (
          phase === "moving" &&
          newBoard.filter((p) => p === opponent).length < 3
        )
          setWinner(player);
        else changeTurn();
      } else triggerFeedback("error");
      return;
    }

    if (phase === "placing") {
      if (board[i]) return;
      const newBoard = [...board];
      newBoard[i] = player;
      setBoard(newBoard);
      const newToPlace = { ...toPlace, [player]: toPlace[player] - 1 };
      setToPlace(newToPlace);
      if (isPieceInMill(newBoard, i, player)) {
        setRemoveMode(true);
        triggerFeedback("mill");
      } else {
        triggerFeedback("place");
        if (newToPlace.P1 === 0 && newToPlace.P2 === 0) setPhase("moving");
        changeTurn();
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
          if (isPieceInMill(newBoard, i, player)) {
            setRemoveMode(true);
            triggerFeedback("mill");
          } else {
            triggerFeedback("place");
            changeTurn();
          }
        }
        setSelected(null);
      }
    }
  };

  const resetGame = () => {
    setBoard(Array(24).fill(null));
    setPhase("placing");
    setToPlace({ P1: 9, P2: 9 });
    setCapturedBy({ P1: 0, P2: 0 });
    setWinner(null);
    setRemoveMode(false);
    setShowRestartConfirm(false);
    runToss();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* --- TOP ACTION BAR --- */}
      <View style={styles.topActionBar}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setShowExitConfirm(true)}
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setShowRestartConfirm(true)}
        >
          <Ionicons name="refresh" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <AnimatePresence>
        {isTossing && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.tossOverlay}
          >
            <MotiView
              animate={{
                rotateY: tossResult ? "0deg" : "1080deg",
                backgroundColor:
                  tossResult === "P1"
                    ? "#ef4444"
                    : tossResult === "P2"
                      ? "#3b82f6"
                      : "#fbbf24",
              }}
              transition={{ type: "timing", duration: tossResult ? 500 : 2000 }}
              style={styles.coin}
            >
              <Text style={styles.coinText}>
                {tossResult ? (tossResult === "P1" ? "R" : "B") : "?"}
              </Text>
            </MotiView>
            <Text style={styles.tossText}>
              {tossResult
                ? `${tossResult === "P1" ? "RED" : "BLUE"} STARTS!`
                : "TOSSING..."}
            </Text>
          </MotiView>
        )}
      </AnimatePresence>

      {/* PLAYER 2 SECTION */}
      <View
        style={[
          styles.playerSection,
          player === "P2" && styles.activeSection,
          { marginBottom: 60 },
        ]}
      >
        <View style={styles.headerInfo}>
          <Text style={[styles.playerLabel, { color: "#3b82f6" }]}>
            PLAYER 2
          </Text>
          {player === "P2" && (
            <View style={styles.miniTimer}>
              <Text style={styles.miniTimerText}>{timeLeft}s</Text>
            </View>
          )}
        </View>
        <View style={styles.inventoryRow}>
          {Array.from({ length: toPlace.P2 }).map((_, idx) => (
            <View
              key={idx}
              style={[styles.goti, { backgroundColor: "#3b82f6" }]}
            />
          ))}
        </View>
      </View>

      {/* GAME BOARD AREA */}
      <View style={styles.gameTable}>
        <View style={[styles.sideTrackWrapper, { left: 5 }]}>
          <Text style={styles.sideLabel}>TAKEN</Text>
          <View style={styles.capturedTrack}>
            {Array.from({ length: capturedBy.P2 }).map((_, idx) => (
              <View
                key={idx}
                style={[styles.capturedGoti, { backgroundColor: "#ef4444" }]}
              />
            ))}
          </View>
        </View>

        <View style={styles.boardContainer}>
          <Text style={[styles.statusText, removeMode && { color: "#fbbf24" }]}>
            {removeMode
              ? "⚡ REMOVE ENEMY"
              : player
                ? `${player === "P1" ? "RED" : "BLUE"}'S TURN`
                : "..."}
          </Text>
          <View style={{ transform: [{ scale: 0.65 }] }}>
            <Board
              board={board}
              onPress={handlePress}
              selected={selected}
              activeMills={activeMills}
            />
          </View>
          <Text style={styles.phaseText}>{phase.toUpperCase()} PHASE</Text>
        </View>

        <View style={[styles.sideTrackWrapper, { right: 5 }]}>
          <Text style={styles.sideLabel}>TAKEN</Text>
          <View style={styles.capturedTrack}>
            {Array.from({ length: capturedBy.P1 }).map((_, idx) => (
              <View
                key={idx}
                style={[styles.capturedGoti, { backgroundColor: "#3b82f6" }]}
              />
            ))}
          </View>
        </View>
      </View>

      {/* PLAYER 1 SECTION */}
      <View
        style={[
          styles.playerSection,
          player === "P1" && styles.activeSection,
          { marginTop: 60 },
        ]}
      >
        <View style={styles.inventoryRow}>
          {Array.from({ length: toPlace.P1 }).map((_, idx) => (
            <View
              key={idx}
              style={[styles.goti, { backgroundColor: "#ef4444" }]}
            />
          ))}
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.playerLabel, { color: "#ef4444" }]}>
            PLAYER 1
          </Text>
          {player === "P1" && (
            <View style={styles.miniTimer}>
              <Text style={styles.miniTimerText}>{timeLeft}s</Text>
            </View>
          )}
        </View>
      </View>

      {/* MODALS */}
      <Modal visible={!!winner} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.winCard}>
            <Text style={styles.winEmoji}>🏆</Text>
            <Text style={styles.winTitle}>{winner} WINS!</Text>
            <Pressable style={styles.resetBtn} onPress={resetGame}>
              <Text style={styles.resetText}>PLAY AGAIN</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showExitConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.winCard}>
            <Ionicons name="warning" size={40} color="#fbbf24" />
            <Text style={styles.winTitle}>QUIT?</Text>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <Pressable
                style={[styles.resetBtn, { backgroundColor: "#334155" }]}
                onPress={() => setShowExitConfirm(false)}
              >
                <Text style={styles.resetText}>NO</Text>
              </Pressable>
              <Pressable
                style={[styles.resetBtn, { backgroundColor: "#ef4444" }]}
                onPress={() => router.back()}
              >
                <Text style={styles.resetText}>YES</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showRestartConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.winCard}>
            <Ionicons name="refresh-circle" size={40} color="#3b82f6" />
            <Text style={styles.winTitle}>RESTART?</Text>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <Pressable
                style={[styles.resetBtn, { backgroundColor: "#334155" }]}
                onPress={() => setShowRestartConfirm(false)}
              >
                <Text style={styles.resetText}>NO</Text>
              </Pressable>
              <Pressable
                style={[styles.resetBtn, { backgroundColor: "#3b82f6" }]}
                onPress={resetGame}
              >
                <Text style={styles.resetText}>YES</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 50,
    paddingBottom: 20,
    justifyContent: "center", // Keeps everything in a vertical stack
  },
  topActionBar: {
    position: "absolute",
    top: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 50,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    width: "100%",
    zIndex: 100,
  },
  iconButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  tossOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2, 6, 23, 0.98)",
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
  },
  coin: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  coinText: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  tossText: {
    color: "#fff",
    marginTop: 20,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 2,
  },

  playerSection: {
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#0f172a",
    marginHorizontal: 40,
    borderRadius: 24,
    opacity: 0.5,
  },
  activeSection: {
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#1e293b",
    opacity: 1,
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 5,
  },
  playerLabel: { fontSize: 12, fontWeight: "900", letterSpacing: 2 },
  miniTimer: {
    backgroundColor: "#334155",
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 8,
  },
  miniTimerText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  inventoryRow: { flexDirection: "row", gap: 5, height: 18 },
  goti: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },

  gameTable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
  },
  sideTrackWrapper: {
    position: "absolute",
    width: 35,
    alignItems: "center",
    zIndex: 10,
  },
  sideLabel: {
    color: "#475569",
    fontSize: 6,
    fontWeight: "bold",
    marginBottom: 2,
  },
  capturedTrack: {
    backgroundColor: "#0f172a",
    padding: 5,
    borderRadius: 12,
    gap: 8,
    height: SCREEN_HEIGHT * 0.35,
    width: "100%",
    borderWidth: 1,
    borderColor: "#1e293b",
    justifyContent: "center",
  },
  capturedGoti: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#fff",
  },

  boardContainer: {
    alignItems: "center",
    backgroundColor: "#1e293b",
    padding: 5,
    borderRadius: 24,
    width: SCREEN_WIDTH * 0.72,
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 0,
    fontSize: 12,
    textAlign: "center",
  },
  phaseText: {
    color: "#64748b",
    fontSize: 8,
    marginTop: 0,
    fontWeight: "bold",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  winCard: {
    backgroundColor: "#1e293b",
    padding: 30,
    borderRadius: 32,
    alignItems: "center",
    width: "80%",
    borderWidth: 1,
    borderColor: "#4f46e5",
  },
  winEmoji: { fontSize: 50, marginBottom: 10 },
  winTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  resetBtn: {
    backgroundColor: "#4f46e5",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  resetText: { color: "#fff", fontWeight: "bold" },
});

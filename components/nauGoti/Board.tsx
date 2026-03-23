import React from "react";
import Svg, { Circle, Line, Rect } from "react-native-svg";

const points = [
  [20, 20],
  [150, 20],
  [280, 20], // Outer
  [60, 60],
  [150, 60],
  [240, 60], // Middle
  [100, 100],
  [150, 100],
  [200, 100], // Inner
  [20, 150],
  [60, 150],
  [100, 150],
  [200, 150],
  [240, 150],
  [280, 150], // Mid-cross
  [100, 200],
  [150, 200],
  [200, 200],
  [60, 240],
  [150, 240],
  [240, 240],
  [20, 280],
  [150, 280],
  [280, 280],
];

export default function Board({ board, onPress, selected }: any) {
  return (
    <Svg height="320" width="320" viewBox="0 0 300 300">
      {/* Background Board Lines */}
      <Rect
        x="20"
        y="20"
        width="260"
        height="260"
        stroke="#475569"
        strokeWidth="2"
        fill="none"
      />
      <Rect
        x="60"
        y="60"
        width="180"
        height="180"
        stroke="#475569"
        strokeWidth="2"
        fill="none"
      />
      <Rect
        x="100"
        y="100"
        width="100"
        height="100"
        stroke="#475569"
        strokeWidth="2"
        fill="none"
      />

      {/* Cross Lines */}
      <Line
        x1="150"
        y1="20"
        x2="150"
        y2="100"
        stroke="#475569"
        strokeWidth="2"
      />
      <Line
        x1="150"
        y1="200"
        x2="150"
        y2="280"
        stroke="#475569"
        strokeWidth="2"
      />
      <Line
        x1="20"
        y1="150"
        x2="100"
        y2="150"
        stroke="#475569"
        strokeWidth="2"
      />
      <Line
        x1="200"
        y1="150"
        x2="280"
        y2="150"
        stroke="#475569"
        strokeWidth="2"
      />

      {/* Actual Goti Points */}
      {points.map(([x, y], i) => (
        <Circle
          key={i}
          cx={x}
          cy={y}
          r={selected === i ? "16" : "12"}
          fill={
            board[i] === "P1"
              ? "#ef4444"
              : board[i] === "P2"
                ? "#3b82f6"
                : "#1e293b"
          }
          stroke={selected === i ? "#fbbf24" : "#94a3b8"}
          strokeWidth={selected === i ? "4" : "1"}
          onPress={() => onPress(i)}
        />
      ))}
    </Svg>
  );
}

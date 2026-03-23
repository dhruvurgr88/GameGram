export const mills = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [9, 10, 11],
  [12, 13, 14],
  [15, 16, 17],
  [18, 19, 20],
  [21, 22, 23],
  [0, 9, 21],
  [3, 10, 18],
  [6, 11, 15],
  [1, 4, 7],
  [16, 19, 22],
  [8, 12, 17],
  [5, 13, 20],
  [2, 14, 23],
];

export const adjacency: Record<number, number[]> = {
  0: [1, 9],
  1: [0, 2, 4],
  2: [1, 14],
  3: [4, 10],
  4: [1, 3, 5, 7],
  5: [4, 13],
  6: [7, 11],
  7: [4, 6, 8],
  8: [7, 12],
  9: [0, 10, 21],
  10: [3, 9, 11, 18],
  11: [6, 10, 15],
  12: [8, 13, 17],
  13: [5, 12, 14, 20],
  14: [2, 13, 23],
  15: [11, 16],
  16: [15, 17, 19],
  17: [12, 16],
  18: [10, 19],
  19: [16, 18, 20, 22],
  20: [13, 19],
  21: [9, 22],
  22: [19, 21, 23],
  23: [14, 22],
};

export const isPieceInMill = (board: (string | null)[], index: number) => {
  const player = board[index];
  if (!player) return false;
  return mills.some(
    (m) => m.includes(index) && m.every((i) => board[i] === player),
  );
};

export const canRemovePiece = (
  board: (string | null)[],
  index: number,
  opponent: string,
) => {
  if (board[index] !== opponent) return false;
  if (!isPieceInMill(board, index)) return true;
  // If the piece is in a mill, check if ALL opponent pieces are in mills
  const opponentIndices = board
    .map((p, idx) => (p === opponent ? idx : -1))
    .filter((i) => i !== -1);
  return opponentIndices.every((idx) => isPieceInMill(board, idx));
};

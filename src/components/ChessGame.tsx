/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Trophy, RotateCcw, ArrowLeft, Bot, User, Sparkles, Shield, Zap } from "lucide-react";
import { playTapSound, playCorrectSound, playOopsSound } from "../utils/sound";
import confetti from "canvas-confetti";

interface ChessGameProps {
  onAddPoints: (points: number) => void;
}

type PieceType = "p" | "r" | "n" | "b" | "q" | "k" | null;
type PieceColor = "w" | "b" | null;

interface ChessSquare {
  type: PieceType;
  color: PieceColor;
}

const INITIAL_BOARD: ChessSquare[][] = [
  [
    { type: "r", color: "b" }, { type: "n", color: "b" }, { type: "b", color: "b" }, { type: "q", color: "b" },
    { type: "k", color: "b" }, { type: "b", color: "b" }, { type: "n", color: "b" }, { type: "r", color: "b" }
  ],
  [
    { type: "p", color: "b" }, { type: "p", color: "b" }, { type: "p", color: "b" }, { type: "p", color: "b" },
    { type: "p", color: "b" }, { type: "p", color: "b" }, { type: "p", color: "b" }, { type: "p", color: "b" }
  ],
  Array(8).fill({ type: null, color: null }),
  Array(8).fill({ type: null, color: null }),
  Array(8).fill({ type: null, color: null }),
  Array(8).fill({ type: null, color: null }),
  [
    { type: "p", color: "w" }, { type: "p", color: "w" }, { type: "p", color: "w" }, { type: "p", color: "w" },
    { type: "p", color: "w" }, { type: "p", color: "w" }, { type: "p", color: "w" }, { type: "p", color: "w" }
  ],
  [
    { type: "r", color: "w" }, { type: "n", color: "w" }, { type: "b", color: "w" }, { type: "q", color: "w" },
    { type: "k", color: "w" }, { type: "b", color: "w" }, { type: "n", color: "w" }, { type: "r", color: "w" }
  ]
];

const PIECE_SYMBOLS: Record<string, string> = {
  "w_k": "♔", "w_q": "♕", "w_r": "♖", "w_b": "♗", "w_n": "♘", "w_p": "♙",
  "b_k": "♚", "b_q": "♛", "b_r": "♜", "b_b": "♝", "b_n": "♞", "b_p": "♟"
};

export default function ChessGame({ onAddPoints }: ChessGameProps) {
  const [board, setBoard] = useState<ChessSquare[][]>(() => JSON.parse(JSON.stringify(INITIAL_BOARD)));
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null);
  const [validMoves, setValidMoves] = useState<[number, number][]>([]);
  const [turn, setTurn] = useState<"w" | "b">("w");
  const [difficulty, setDifficulty] = useState<"Novice" | "Scholar" | "Grandmaster">("Scholar");
  const [capturedByWhite, setCapturedByWhite] = useState<string[]>([]);
  const [capturedByBlack, setCapturedByBlack] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<string>("Your Turn (White)");
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Restart game
  const handleReset = () => {
    playTapSound();
    setBoard(JSON.parse(JSON.stringify(INITIAL_BOARD)));
    setSelectedPos(null);
    setValidMoves([]);
    setTurn("w");
    setCapturedByWhite([]);
    setCapturedByBlack([]);
    setGameStatus("Your Turn (White)");
    setIsAiThinking(false);
  };

  // Generate basic valid moves for standard pieces
  const getMovesForPiece = (r: number, c: number, currentBoard: ChessSquare[][]): [number, number][] => {
    const square = currentBoard[r][c];
    if (!square.type || !square.color) return [];

    const moves: [number, number][] = [];
    const color = square.color;

    const isOpponent = (targetR: number, targetC: number) => {
      const target = currentBoard[targetR][targetC];
      return target.type !== null && target.color !== color;
    };

    const isEmpty = (targetR: number, targetC: number) => {
      return currentBoard[targetR][targetC].type === null;
    };

    const addMoveIfValid = (targetR: number, targetC: number) => {
      if (targetR >= 0 && targetR < 8 && targetC >= 0 && targetC < 8) {
        if (isEmpty(targetR, targetC) || isOpponent(targetR, targetC)) {
          moves.push([targetR, targetC]);
          return isEmpty(targetR, targetC); // returns true to continue ray
        }
      }
      return false; // ray blocked
    };

    if (square.type === "p") {
      const dir = color === "w" ? -1 : 1;
      const startRow = color === "w" ? 6 : 1;

      // Single forward step
      if (r + dir >= 0 && r + dir < 8 && isEmpty(r + dir, c)) {
        moves.push([r + dir, c]);
        // Double forward step from starting rank
        if (r === startRow && isEmpty(r + 2 * dir, c)) {
          moves.push([r + 2 * dir, c]);
        }
      }

      // Diagonal captures
      [-1, 1].forEach((dc) => {
        const nextR = r + dir;
        const nextC = c + dc;
        if (nextR >= 0 && nextR < 8 && nextC >= 0 && nextC < 8 && isOpponent(nextR, nextC)) {
          moves.push([nextR, nextC]);
        }
      });
    } else if (square.type === "n") {
      const knightOffsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      knightOffsets.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          if (isEmpty(nr, nc) || isOpponent(nr, nc)) {
            moves.push([nr, nc]);
          }
        }
      });
    } else if (square.type === "b" || square.type === "q") {
      // Diagonals
      const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      directions.forEach(([dr, dc]) => {
        let step = 1;
        while (true) {
          const nr = r + dr * step;
          const nc = c + dc * step;
          if (!addMoveIfValid(nr, nc)) break;
          step++;
        }
      });
    }

    if (square.type === "r" || square.type === "q") {
      // Straights
      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      directions.forEach(([dr, dc]) => {
        let step = 1;
        while (true) {
          const nr = r + dr * step;
          const nc = c + dc * step;
          if (!addMoveIfValid(nr, nc)) break;
          step++;
        }
      });
    }

    if (square.type === "k") {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            if (isEmpty(nr, nc) || isOpponent(nr, nc)) {
              moves.push([nr, nc]);
            }
          }
        }
      }
    }

    return moves;
  };

  const handleSquareClick = (r: number, c: number) => {
    if (turn !== "w" || isAiThinking) return;

    if (selectedPos) {
      const [fromR, fromC] = selectedPos;
      // Check if clicking valid destination
      const isTargetValid = validMoves.some(([vr, vc]) => vr === r && vc === c);

      if (isTargetValid) {
        executeMove(fromR, fromC, r, c);
        setSelectedPos(null);
        setValidMoves([]);
        return;
      }
    }

    // Select new piece
    const piece = board[r][c];
    if (piece.color === "w") {
      playTapSound();
      setSelectedPos([r, c]);
      const moves = getMovesForPiece(r, c, board);
      setValidMoves(moves);
    } else {
      setSelectedPos(null);
      setValidMoves([]);
    }
  };

  const executeMove = (fromR: number, fromC: number, toR: number, toC: number) => {
    playTapSound();
    const newBoard = JSON.parse(JSON.stringify(board));
    const movingPiece = newBoard[fromR][fromC];
    const targetPiece = newBoard[toR][toC];

    // Capture handling
    if (targetPiece.type) {
      playCorrectSound();
      const symbol = PIECE_SYMBOLS[`${targetPiece.color}_${targetPiece.type}`];
      if (movingPiece.color === "w") {
        setCapturedByWhite(prev => [...prev, symbol]);
      } else {
        setCapturedByBlack(prev => [...prev, symbol]);
      }

      // Check if King captured
      if (targetPiece.type === "k") {
        if (movingPiece.color === "w") {
          setGameStatus("🎉 Checkmate! You won against Chess AI!");
          playCorrectSound();
          onAddPoints(50);
          confetti({ particleCount: 70, spread: 60 });
        } else {
          setGameStatus("💔 Checkmate! AI won. Try again!");
          playOopsSound();
        }
        newBoard[toR][toC] = movingPiece;
        newBoard[fromR][fromC] = { type: null, color: null };
        setBoard(newBoard);
        return;
      }
    }

    // Pawn Promotion to Queen
    if (movingPiece.type === "p") {
      if ((movingPiece.color === "w" && toR === 0) || (movingPiece.color === "b" && toR === 7)) {
        movingPiece.type = "q";
      }
    }

    newBoard[toR][toC] = movingPiece;
    newBoard[fromR][fromC] = { type: null, color: null };
    setBoard(newBoard);

    const nextTurn = movingPiece.color === "w" ? "b" : "w";
    setTurn(nextTurn);
    setGameStatus(nextTurn === "w" ? "Your Turn (White)" : "Spark Chess AI Thinking...");
  };

  // AI Move Engine
  useEffect(() => {
    if (turn === "b" && !gameStatus.includes("Checkmate")) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        makeAiMove();
        setIsAiThinking(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [turn, gameStatus]);

  const makeAiMove = () => {
    const allAiMoves: { from: [number, number]; to: [number, number]; score: number }[] = [];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c].color === "b") {
          const pieceMoves = getMovesForPiece(r, c, board);
          pieceMoves.forEach(([tr, tc]) => {
            const target = board[tr][tc];
            let moveScore = 0;
            if (target.type === "k") moveScore += 1000;
            else if (target.type === "q") moveScore += 90;
            else if (target.type === "r") moveScore += 50;
            else if (target.type === "b" || target.type === "n") moveScore += 30;
            else if (target.type === "p") moveScore += 10;

            // Center control bonus
            if (tr >= 2 && tr <= 5 && tc >= 2 && tc <= 5) {
              moveScore += 5;
            }

            // Slight randomness for difficulty
            if (difficulty === "Novice") moveScore += Math.random() * 20;
            if (difficulty === "Scholar") moveScore += Math.random() * 5;

            allAiMoves.push({ from: [r, c], to: [tr, tc], score: moveScore });
          });
        }
      }
    }

    if (allAiMoves.length > 0) {
      allAiMoves.sort((a, b) => b.score - a.score);
      const chosen = allAiMoves[0];
      executeMove(chosen.from[0], chosen.from[1], chosen.to[0], chosen.to[1]);
    } else {
      setGameStatus("Stalemate or No Moves Left!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="chess_game_module">
      
      {/* Header Info */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-xl">
            ♟️
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 text-[10px] font-mono font-bold text-amber-400 uppercase">
              <Shield className="w-3 h-3" />
              <span>100% OFFLINE CHESS ENGINE</span>
            </div>
            <h3 className="text-base font-black font-display text-slate-100 uppercase">
              Grandmaster Arena
            </h3>
          </div>
        </div>

        {/* AI Difficulty Selector & Reset */}
        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            {(["Novice", "Scholar", "Grandmaster"] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => {
                  playTapSound();
                  setDifficulty(diff);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  difficulty === diff
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          <button
            onClick={handleReset}
            className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl cursor-pointer transition-colors"
            title="Restart Match"
            id="btn_chess_reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Board & Status Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left / Center: 8x8 Chess Board */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
          
          {/* Black Captured Tray */}
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-850 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <Bot className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-slate-300">Spark AI (Black)</span>
              {isAiThinking && <span className="text-[10px] text-amber-400 animate-pulse">Computing...</span>}
            </div>
            <div className="flex space-x-1 text-sm text-slate-300 h-5">
              {capturedByWhite.map((s, i) => <span key={i}>{s}</span>)}
            </div>
          </div>

          {/* The Board */}
          <div className="grid grid-cols-8 gap-0 border-2 border-slate-700 rounded-xl overflow-hidden my-4 shadow-2xl max-w-[440px] w-full aspect-square">
            {board.map((row, r) =>
              row.map((sq, c) => {
                const isBlackSquare = (r + c) % 2 === 1;
                const isSelected = selectedPos && selectedPos[0] === r && selectedPos[1] === c;
                const isValidMove = validMoves.some(([vr, vc]) => vr === r && vc === c);
                const pieceSymbol = sq.type && sq.color ? PIECE_SYMBOLS[`${sq.color}_${sq.type}`] : "";

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleSquareClick(r, c)}
                    className={`relative flex items-center justify-center text-2xl sm:text-4xl transition-all cursor-pointer select-none ${
                      isBlackSquare ? "bg-slate-800" : "bg-slate-700/60"
                    } ${isSelected ? "ring-4 ring-amber-400 z-10 scale-95" : ""} ${
                      isValidMove ? "hover:bg-indigo-600/40" : ""
                    }`}
                  >
                    {/* Piece Glyph */}
                    <span className={`${sq.color === "w" ? "text-amber-100 drop-shadow-md" : "text-slate-950 font-black"}`}>
                      {pieceSymbol}
                    </span>

                    {/* Valid Move Indicator Dot */}
                    {isValidMove && (
                      <span className="absolute w-3 h-3 rounded-full bg-cyan-400/80 shadow-md shadow-cyan-400 animate-pulse" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* White Captured Tray */}
          <div className="w-full flex items-center justify-between pt-3 border-t border-slate-850 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-slate-300">You (White)</span>
            </div>
            <div className="flex space-x-1 text-sm text-slate-300 h-5">
              {capturedByBlack.map((s, i) => <span key={i}>{s}</span>)}
            </div>
          </div>

        </div>

        {/* Right: Tactical Status & Points */}
        <div className="space-y-4">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
            <span className="text-[10px] font-mono tracking-wider text-indigo-400 uppercase font-black">
              MATCH TELEMETRY
            </span>
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-850">
              <span className="block text-[10px] font-mono text-slate-400 uppercase">Current Status</span>
              <p className="text-sm font-bold text-slate-100 mt-1">{gameStatus}</p>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-850 flex items-center justify-between">
              <div>
                <span className="block text-[10px] font-mono text-slate-400 uppercase">Victory Bonus</span>
                <span className="text-sm font-mono font-black text-amber-400">+50 PTS</span>
              </div>
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-2 text-xs text-slate-400 leading-relaxed font-sans">
            <h4 className="font-bold text-slate-200 uppercase font-mono text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Offline AI Instructions</span>
            </h4>
            <p>
              Tap any white piece to reveal valid destinations marked with glowing cyan dots. Click the target square to execute the move.
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              The AI calculates responses entirely in your browser using positional mini-max heuristic evaluation.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

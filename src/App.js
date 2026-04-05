import React, { useState } from "react";

const N = 8;

const emptyBoard = () =>
  Array.from({ length: N }, () => Array(N).fill(false));

const clone = (b) => b.map((row) => [...row]);

// 🔊 FAHHH SOUND
let fahhhAudio;
function playErrorSound() {
  if (!fahhhAudio) {
    fahhhAudio = new Audio("/fahhhhh.mp3");
    fahhhAudio.volume = 1.0;
  }
  fahhhAudio.currentTime = 0;
  fahhhAudio.play().catch(() => { });
}

export default function App() {
  const [board, setBoard] = useState(emptyBoard());
  const [history, setHistory] = useState([]);
  const [redo, setRedo] = useState([]);

  const isSafe = (b, r, c) => {
    for (let i = 0; i < N; i++) {
      if (b[i][c]) return false;
      if (b[r][i]) return false;
    }

    for (let i = -N; i < N; i++) {
      if (b[r + i]?.[c + i]) return false;
      if (b[r + i]?.[c - i]) return false;
    }

    return true;
  };

  const place = (r, c) => {
    const b = clone(board);

    // ❌ invalid move → FAHHH sound
    if (!b[r][c] && !isSafe(b, r, c)) {
      playErrorSound();
      return;
    }

    b[r][c] = !b[r][c];

    setHistory([...history, board]);
    setRedo([]);
    setBoard(b);
  };

  const undo = () => {
    if (!history.length) return;
    setRedo([board, ...redo]);
    setBoard(history[history.length - 1]);
    setHistory(history.slice(0, -1));
  };

  const redoMove = () => {
    if (!redo.length) return;
    setHistory([...history, board]);
    setBoard(redo[0]);
    setRedo(redo.slice(1));
  };

  const solve = (b) => {
    const helper = (col) => {
      if (col === N) return true;
      for (let r = 0; r < N; r++) {
        if (isSafe(b, r, col)) {
          b[r][col] = true;
          if (helper(col + 1)) return true;
          b[r][col] = false;
        }
      }
      return false;
    };
    helper(0);
  };

  const hint = () => {
    const b = clone(board);
    solve(b);
    setBoard(b);
  };

  const autoSolve = async () => {
    let b = emptyBoard();
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    async function helper(col) {
      if (col === N) return true;
      for (let r = 0; r < N; r++) {
        if (isSafe(b, r, col)) {
          b[r][col] = true;
          setBoard(clone(b));
          await sleep(150);

          if (await helper(col + 1)) return true;

          b[r][col] = false;
          setBoard(clone(b));
        }
      }
      return false;
    }

    await helper(0);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "black",
        color: "white",
      }}
    >
      <h1 style={{ fontSize: "28px", marginBottom: "10px" }}>
        ♛ 8 Queens
      </h1>

      {/* BOARD */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 60px)",
          border: "2px solid white",
        }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => {
            const dark = (r + c) % 2;

            return (
              <div
                key={r + "-" + c}
                onClick={() => place(r, c)}
                style={{
                  width: 60,
                  height: 60,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  backgroundColor: dark ? "#444" : "#ddd",
                  transition: "0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.opacity = 0.7)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.opacity = 1)
                }
              >
                {cell && (
                  <span
                    style={{
                      fontSize: "28px",
                      color: "#a855f7",
                      textShadow: "0 0 8px #a855f7",
                    }}
                  >
                    ♛
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* BUTTONS */}
      <div style={{ marginTop: 15 }}>
        {[
          ["Undo", undo],
          ["Redo", redoMove],
          ["Hint", hint],
          ["Auto Solve", autoSolve],
          ["Reset", () => setBoard(emptyBoard())],
        ].map(([text, fn], i) => (
          <button
            key={i}
            onClick={fn}
            style={{
              padding: "8px 12px",
              margin: "5px",
              background: "#222",
              color: "white",
              border: "1px solid #555",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
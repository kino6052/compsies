import { c, geUseState } from "./compsies/compsies";
import { render } from "./compsies/dom/render";

// Root element reference
const rootElement = document.querySelector("#root") as HTMLElement;

// Helper function to re-render the application with debouncing
let renderTimeout: number | null = null;
const renderApp = () => {
  if (renderTimeout) {
    clearTimeout(renderTimeout);
  }
  renderTimeout = setTimeout(() => {
    render(App(), rootElement);
    renderTimeout = null;
  }, 10) as unknown as number;
};

// Header component
const Header = ({ title }: { title: string }) => {
  return c(
    "header", 'header-id', {},
    [
      c("h1", 'heading-id', {}, [title], "h1")
    ],
    "header"
  );
};

// Square component
const Square = ({ value, index, onClick }: { value: string | null, index: number, onClick: (index: number) => void }) => {
  return c(
    "button", `square-${index}`,
    {
      onclick: () => onClick(index),
      style: {
        width: "100px",
        height: "100px",
        fontSize: "24px",
        fontWeight: "bold",
        margin: "0",
        padding: "0",
        border: "1px solid #999",
        background: "#fff",
        cursor: value ? "default" : "pointer"
      }
    },
    [value || ""],
    "button"
  );
};

// Board component
const Board = ({ squares, onSquareClick }: { squares: Array<string | null>, onSquareClick: (index: number) => void }) => {
  const renderRow = (startIndex: number) => {
    return c(
      "div", `row-${startIndex}`,
      {
        style: {
          display: "flex",
          flexDirection: "row"
        }
      },
      [
        Square({ value: squares[startIndex], index: startIndex, onClick: onSquareClick }),
        Square({ value: squares[startIndex + 1], index: startIndex + 1, onClick: onSquareClick }),
        Square({ value: squares[startIndex + 2], index: startIndex + 2, onClick: onSquareClick })
      ],
      "div"
    );
  };

  return c(
    "div", 'board-id',
    { style: { display: "inline-block" } },
    [
      renderRow(0),
      renderRow(3),
      renderRow(6)
    ],
    "div"
  );
};

// Status component
const Status = ({ currentPlayer, winner, gameOver }: { currentPlayer: string, winner: string | null, gameOver: boolean }) => {
  let status;
  if (winner) {
    status = `Winner: ${winner}`;
  } else if (gameOver) {
    status = "Game ended in a draw!";
  } else {
    status = `Next player: ${currentPlayer}`;
  }

  return c(
    "div", 'status-id',
    { style: { marginBottom: "20px", fontSize: "18px", fontWeight: "bold" } },
    [status],
    "div"
  );
};

// Reset Button component
const ResetButton = ({ onReset }: { onReset: () => void }) => {
  return c(
    "button", 'reset-button-id',
    {
      onclick: onReset,
      style: {
        marginTop: "20px",
        padding: "10px 20px",
        fontSize: "16px",
        background: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer"
      }
    },
    ["Reset Game"],
    "button"
  );
};

// Initialize state hooks once, outside of components
const boardState = geUseState<Array<string | null>>(Array(9).fill(null), renderApp);
const currentPlayerState = geUseState<string>('X', renderApp);
const winnerState = geUseState<string | null>(null, renderApp);
const gameOverState = geUseState<boolean>(false, renderApp);


// Main App component
const App = () => {
  // Use state hooks for application state
  const [getBoard, setBoard] = boardState();
  const [getCurrentPlayer, setCurrentPlayer] = currentPlayerState();
  const [getWinner, setWinner] = winnerState();
  const [getGameOver, setGameOver] = gameOverState();


  // Helper function to calculate winner
  const calculateWinner = (squares: Array<string | null>): string | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  // Check if the board is full
  const isBoardFull = (squares: Array<string | null>): boolean => {
    return squares.every(square => square !== null);
  };

  // Event handlers
  const handleSquareClick = (index: number): void => {
    // Ignore click if square is filled or game is over
    const board = getBoard();
    const winner = getWinner();
    const gameOver = getGameOver();

    if (board[index] || winner || gameOver) {
      return;
    }

    const newBoard = [...board];

    const currentPlayer = getCurrentPlayer();
    newBoard[index] = currentPlayer;

    const newWinner = calculateWinner(newBoard);
    const isGameOver = newWinner !== null || isBoardFull(newBoard);

    setBoard(newBoard);
    setWinner(newWinner);
    setGameOver(isGameOver);
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  };

  const handleReset = (): void => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setGameOver(false);
  };

  return c(
    "div", 'container-id',
    { style: { maxWidth: "320px", margin: "0 auto", padding: "20px", textAlign: "center" } },
    [
      Header({ title: "Tic Tac Toe" }),
      Status({
        currentPlayer: getCurrentPlayer(),
        winner: getWinner(),
        gameOver: getGameOver() && !getWinner()
      }),
      Board({
        squares: getBoard(),
        onSquareClick: handleSquareClick
      }),
      ResetButton({ onReset: handleReset })
    ],
    "div"
  );
};

// Initial render
renderApp();

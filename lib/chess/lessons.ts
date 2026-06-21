import { START_FEN } from "./utils";

export type LessonStep =
  | {
      type: "concept";
      fen: string;
      text: string;
      highlightSquares?: string[];
    }
  | {
      type: "quiz";
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    }
  | {
      type: "puzzle";
      fen: string;
      prompt: string;
      /** Any of these UCI-style moves ("e2e4", "e7e8q") is accepted as correct. */
      solution: string[];
      orientation?: "w" | "b";
      explainCorrect: string;
      explainWrong: string;
    };

export interface Lesson {
  id: string;
  title: string;
  description: string;
  icon: string;
  steps: LessonStep[];
}

export const LESSONS: Lesson[] = [
  {
    id: "pawn",
    title: "The Pawn",
    description: "How your smallest piece moves and captures.",
    icon: "ChevronUp",
    steps: [
      {
        type: "concept",
        fen: START_FEN,
        text: "The pawn is your most numerous piece — 8 per side. It moves straight forward one square at a time. Unlike every other piece, it captures diagonally instead of in the direction it moves.",
        highlightSquares: ["e2", "e3"],
      },
      {
        type: "concept",
        fen: START_FEN,
        text: "On its very first move, a pawn may advance two squares instead of one. After that first move, it's one square at a time for the rest of the game.",
        highlightSquares: ["e2", "e3", "e4"],
      },
      {
        type: "puzzle",
        fen: "4k3/8/8/8/8/8/4P3/4K3 w - - 0 1",
        prompt: "Move the pawn forward two squares.",
        solution: ["e2e4"],
        explainCorrect: "Exactly — pawns can leap two squares on their first move only.",
        explainWrong: "Not quite. Remember, on its first move a pawn can go one or two squares straight ahead.",
      },
      {
        type: "concept",
        fen: "4k3/8/8/4p3/3P4/8/8/4K3 w - - 0 1",
        text: "A pawn can never capture straight ahead. It only captures one square diagonally forward — here, the White pawn on d4 can capture the Black pawn on e5.",
        highlightSquares: ["d4", "e5"],
      },
      {
        type: "puzzle",
        fen: "4k3/8/8/4p3/3P4/8/8/4K3 w - - 0 1",
        prompt: "Capture the black pawn.",
        solution: ["d4e5"],
        explainCorrect: "That's it — pawns capture diagonally, never straight ahead.",
        explainWrong: "A pawn captures diagonally, one square forward. Look for the enemy pawn on a diagonal from yours.",
      },
      {
        type: "concept",
        fen: "k7/4P3/8/8/8/8/8/4K3 w - - 0 1",
        text: "Reach the far end of the board (the 8th rank for White, the 1st for Black) and your pawn is promoted — almost always to a queen!",
      },
      {
        type: "puzzle",
        fen: "k7/4P3/8/8/8/8/8/4K3 w - - 0 1",
        prompt: "Push the pawn all the way and promote it to a queen.",
        solution: ["e7e8q"],
        explainCorrect: "A brand new queen! Promotion is one of the pawn's most powerful tricks.",
        explainWrong: "Push the pawn forward to the last rank, then choose to promote it to a queen.",
      },
    ],
  },
  {
    id: "rook",
    title: "The Rook",
    description: "Straight lines, any distance.",
    icon: "Minus",
    steps: [
      {
        type: "concept",
        fen: "4k3/8/8/8/3R4/8/8/4K3 w - - 0 1",
        text: "The rook moves in straight lines — horizontally or vertically — any number of squares. It cannot jump over other pieces.",
        highlightSquares: ["d4"],
      },
      {
        type: "puzzle",
        fen: "4k3/3p4/8/8/3R4/8/8/4K3 w - - 0 1",
        prompt: "Capture the pawn with your rook.",
        solution: ["d4d7"],
        explainCorrect: "Straight up the file — rooks love open lines like that one.",
        explainWrong: "The rook moves in straight lines. Look along the file or rank toward the pawn.",
      },
      {
        type: "concept",
        fen: "4k3/8/8/8/8/P7/8/R3K3 w - - 0 1",
        text: "Rooks are blocked by any piece in their path — friend or foe. This rook on a1 can't pass through its own pawn on a3.",
        highlightSquares: ["a1", "a3"],
      },
      {
        type: "puzzle",
        fen: "4k3/8/8/8/8/8/4K3/R7 w - - 0 1",
        prompt: "Move your rook all the way across to h1.",
        solution: ["a1h1"],
        explainCorrect: "A rook can cross the whole board in one move when the path is clear.",
        explainWrong: "With nothing in the way, the rook can travel the entire rank in one move.",
      },
      {
        type: "quiz",
        question: "Rooks are usually most powerful when placed on...",
        options: ["A square next to the king", "An open file or rank", "The first row only", "A corner square"],
        correctIndex: 1,
        explanation: "An open file or rank lets a rook control lots of squares and attack from a distance — especially valuable in the endgame.",
      },
    ],
  },
  {
    id: "bishop",
    title: "The Bishop",
    description: "Diagonal power, one color forever.",
    icon: "X",
    steps: [
      {
        type: "concept",
        fen: "4k3/8/8/8/3B4/8/8/4K3 w - - 0 1",
        text: "The bishop moves diagonally, any number of squares. Notice it always stays on squares of one color — this one will live on light squares its entire life.",
        highlightSquares: ["d4"],
      },
      {
        type: "puzzle",
        fen: "4k3/6p1/8/8/3B4/8/8/4K3 w - - 0 1",
        prompt: "Capture the pawn with your bishop.",
        solution: ["d4g7"],
        explainCorrect: "Right along the diagonal — bishops can cover a lot of ground when it's open.",
        explainWrong: "The bishop only moves diagonally. Find the diagonal line connecting your bishop to the pawn.",
      },
      {
        type: "concept",
        fen: "4k3/8/8/8/8/8/1P6/2B1K3 w - - 0 1",
        text: "Just like the rook, a bishop can't jump over pieces. This bishop's path toward a3 is blocked by its own pawn on b2.",
        highlightSquares: ["c1", "b2"],
      },
      {
        type: "puzzle",
        fen: "4k3/5p2/8/8/2B5/8/8/4K3 w - - 0 1",
        prompt: "Capture the pawn with your bishop.",
        solution: ["c4f7"],
        explainCorrect: "Nice eye — that whole diagonal was open.",
        explainWrong: "Trace the diagonal from the bishop — the pawn is sitting right on it.",
      },
      {
        type: "quiz",
        question: "Why are two bishops together especially strong?",
        options: [
          "They can move like rooks",
          "Together they cover both light and dark squares",
          "They become immune to capture",
          "They can jump over pieces",
        ],
        correctIndex: 1,
        explanation: "A single bishop only ever controls one color of square. A pair covers the whole board between them.",
      },
    ],
  },
  {
    id: "knight",
    title: "The Knight",
    description: "The only piece that jumps.",
    icon: "Shuffle",
    steps: [
      {
        type: "concept",
        fen: "4k3/8/8/8/3N4/8/8/4K3 w - - 0 1",
        text: "The knight moves in an L-shape: two squares in one direction, then one square perpendicular. It's the only piece that can jump over other pieces.",
        highlightSquares: ["d4"],
      },
      {
        type: "concept",
        fen: "4k3/8/8/8/3N4/8/8/4K3 w - - 0 1",
        text: "From the center, a knight can reach up to 8 different squares. Here are all of this knight's options from d4.",
        highlightSquares: ["b3", "b5", "c2", "c6", "e2", "e6", "f3", "f5"],
      },
      {
        type: "puzzle",
        fen: "4k3/8/8/8/3N4/8/8/4K3 w - - 0 1",
        prompt: "Move the knight to f5.",
        solution: ["d4f5"],
        explainCorrect: "That's the L-shape in action.",
        explainWrong: "Picture the L-shape: two squares one way, one square the other way.",
      },
      {
        type: "puzzle",
        fen: "4k3/8/8/8/8/2p5/PPPP4/1N2K3 w - - 0 1",
        prompt: "Capture the pawn on c3 — yes, your knight can jump right over your own pawns to get there.",
        solution: ["b1c3"],
        explainCorrect: "Exactly — the knight doesn't care what's in between. It jumps straight to its landing square.",
        explainWrong: "Don't worry about the pawns in the way — knights jump over everything. Look for the L-shape to c3.",
      },
      {
        type: "concept",
        fen: "4k3/8/8/8/8/8/8/N3K3 w - - 0 1",
        text: "\"A knight on the rim is dim.\" From a corner like a1, this knight only reaches 2 squares. From the center, it would reach up to 8. Keep your knights active!",
      },
    ],
  },
  {
    id: "queen",
    title: "The Queen",
    description: "Rook and bishop, combined.",
    icon: "Crown",
    steps: [
      {
        type: "concept",
        fen: "4k3/8/8/8/3Q4/8/8/4K3 w - - 0 1",
        text: "The queen combines the rook's straight lines with the bishop's diagonals — any direction, any distance. It's your most powerful piece.",
        highlightSquares: ["d4"],
      },
      {
        type: "puzzle",
        fen: "4k3/3p4/8/8/3Q4/8/8/4K3 w - - 0 1",
        prompt: "Capture the pawn in a straight line.",
        solution: ["d4d7"],
        explainCorrect: "Straight up the file, just like a rook would.",
        explainWrong: "The queen can move like a rook too — straight along the file toward the pawn.",
      },
      {
        type: "puzzle",
        fen: "4k3/6p1/8/8/3Q4/8/8/4K3 w - - 0 1",
        prompt: "Now capture this pawn along a diagonal.",
        solution: ["d4g7"],
        explainCorrect: "And diagonally too — that's what makes the queen so dangerous.",
        explainWrong: "The queen also moves like a bishop. Find the diagonal toward the pawn.",
      },
      {
        type: "quiz",
        question: "What's the risk of bringing your queen out very early in the game?",
        options: [
          "It can't move diagonally yet",
          "It can be attacked and chased by your opponent's cheaper pieces, costing you time",
          "It loses the ability to capture",
          "There is no risk at all",
        ],
        correctIndex: 1,
        explanation: "A queen attacked by a knight or pawn has to retreat, and you've lost moves developing other pieces. Bring out minor pieces first.",
      },
    ],
  },
  {
    id: "king",
    title: "The King & Check",
    description: "One square at a time — but never into danger.",
    icon: "ShieldAlert",
    steps: [
      {
        type: "concept",
        fen: "4k3/8/8/8/3K4/8/8/8 w - - 0 1",
        text: "The king moves only one square in any direction — up, down, sideways, or diagonally. It's the weakest mover on the board, but it's the piece you must always protect.",
        highlightSquares: ["d4"],
      },
      {
        type: "concept",
        fen: "4k3/8/8/8/8/8/8/K3Q3 b - - 0 1",
        text: "When a piece attacks the square the king stands on, the king is in \"check.\" Here, the White queen attacks the Black king along the open e-file.",
        highlightSquares: ["e1", "e8"],
      },
      {
        type: "puzzle",
        fen: "k7/8/8/8/4r3/8/8/4K3 w - - 0 1",
        prompt: "Your king is in check from the rook. Move it to safety.",
        solution: ["e1d1", "e1d2", "e1f1", "e1f2"],
        explainCorrect: "Safe! Whenever you're in check you must immediately get out of it — move the king, block the attack, or capture the attacker.",
        explainWrong: "The king can't stay on a square the rook attacks, and it can't stay on the e-file. Try a square off that file.",
      },
      {
        type: "concept",
        fen: "4k3/8/8/8/3K4/8/8/8 w - - 0 1",
        text: "The king can never actually be captured. The instant it has no way to escape check, the game ends immediately — that's checkmate, and we'll cover it soon.",
      },
    ],
  },
  {
    id: "special-moves",
    title: "Special Moves",
    description: "Castling, en passant, and promotion.",
    icon: "Sparkles",
    steps: [
      {
        type: "concept",
        fen: "4k3/8/8/8/8/8/8/4K2R w K - 0 1",
        text: "Castling lets you move your king two squares toward a rook (which hops next to it) in one move — as long as neither piece has moved yet, the squares between them are empty, and the king isn't moving through check.",
        highlightSquares: ["e1", "h1"],
      },
      {
        type: "puzzle",
        fen: "4k3/8/8/8/8/8/8/4K2R w K - 0 1",
        prompt: "Castle kingside.",
        solution: ["e1g1"],
        explainCorrect: "Castled! Your king is safer in the corner and your rook joins the action.",
        explainWrong: "Move your king two squares toward the rook on h1 to castle.",
      },
      {
        type: "concept",
        fen: "k7/8/8/3pP3/8/8/8/4K3 w - d6 0 1",
        text: "En passant (\"in passing\") is a special pawn capture. When an enemy pawn rushes two squares and lands right beside yours, you may capture it as if it had only moved one square.",
        highlightSquares: ["e5", "d5"],
      },
      {
        type: "puzzle",
        fen: "k7/8/8/3pP3/8/8/8/4K3 w - d6 0 1",
        prompt: "Capture the black pawn en passant.",
        solution: ["e5d6"],
        explainCorrect: "That's en passant — a rule that catches a lot of beginners off guard!",
        explainWrong: "The black pawn just rushed two squares past yours. Capture diagonally onto the square it skipped over.",
      },
      {
        type: "quiz",
        question: "A pawn that reaches the last rank must promote to a queen.",
        options: ["True", "False — you can choose queen, rook, bishop, or knight"],
        correctIndex: 1,
        explanation: "Queen is usually strongest, but an underpromotion to a knight can sometimes deliver a sneaky check or avoid stalemate tricks.",
      },
    ],
  },
  {
    id: "checkmate-stalemate",
    title: "Checkmate & Stalemate",
    description: "How games actually end.",
    icon: "Flag",
    steps: [
      {
        type: "concept",
        fen: "4k3/8/8/8/8/8/8/K3Q3 b - - 0 1",
        text: "Check means the king is attacked right now. The player in check must respond immediately on their turn.",
      },
      {
        type: "concept",
        fen: "7k/6Q1/6K1/8/8/8/8/8 b - - 0 1",
        text: "Checkmate is check with no way out — the king can't move to safety, nothing can block the attack, and the attacker can't be captured. The game ends instantly.",
        highlightSquares: ["h8", "g7"],
      },
      {
        type: "puzzle",
        fen: "7k/Q7/6K1/8/8/8/8/8 w - - 0 1",
        prompt: "Find checkmate in one move.",
        solution: ["a7g7"],
        explainCorrect: "Checkmate! The king can't escape to g8 or h7 — your queen and king cover everything, and the queen can't be captured.",
        explainWrong: "Look for a square that attacks the king while covering every one of its escape squares.",
      },
      {
        type: "concept",
        fen: "k7/8/1QK5/8/8/8/8/8 b - - 0 1",
        text: "Stalemate is the opposite trap: the player to move has no legal moves at all, but isn't in check. That's an immediate draw — even if one side has way more material. Watch out for this when you're way ahead!",
      },
    ],
  },
  {
    id: "tactics-intro",
    title: "Intro to Tactics",
    description: "Forks, pins, and skewers.",
    icon: "Swords",
    steps: [
      {
        type: "concept",
        fen: START_FEN,
        text: "A fork is when one of your pieces attacks two (or more) enemy pieces at the same time. Your opponent can usually only save one of them.",
      },
      {
        type: "puzzle",
        fen: "r3k3/8/N7/8/8/8/8/4K3 w - - 0 1",
        prompt: "Find the knight move that forks the king and rook.",
        solution: ["a6c7"],
        explainCorrect: "Forked! That knight now attacks both the king and the rook — Black can only save one.",
        explainWrong: "Look for a square the knight can jump to that attacks both the king on e8 and the rook on a8.",
      },
      {
        type: "concept",
        fen: START_FEN,
        text: "A pin is when a piece can't move (or can't move freely) because doing so would expose a more valuable piece — often the king — behind it on the same line.",
      },
      {
        type: "puzzle",
        fen: "5k2/4n3/8/8/8/8/8/2B1K3 w - - 0 1",
        prompt: "Find the move that pins the black knight to its king.",
        solution: ["c1a3"],
        explainCorrect: "Pinned! The knight on e7 can't move off that diagonal without exposing the king to check.",
        explainWrong: "Look for a diagonal that lines up the bishop, the knight, and the black king all in a row.",
      },
      {
        type: "concept",
        fen: START_FEN,
        text: "A skewer is like a pin in reverse: the more valuable piece is in front. Attack it with check, and when it has to move out of the way, you win the piece behind it.",
      },
      {
        type: "puzzle",
        fen: "3q4/8/8/8/3k4/8/8/R3K3 w - - 0 1",
        prompt: "Find the move that skewers the king and queen on the d-file.",
        solution: ["a1d1"],
        explainCorrect: "That's the skewer — the king must move out of check, and then the queen behind it falls.",
        explainWrong: "Get your rook onto the same file as both the king and the queen behind it.",
      },
    ],
  },
  {
    id: "mating-patterns",
    title: "Checkmate Patterns",
    description: "Recognize the finish.",
    icon: "Trophy",
    steps: [
      {
        type: "concept",
        fen: START_FEN,
        text: "Back-rank mate happens when a king is trapped on its own back rank by its own pieces, with nowhere to go when a rook or queen arrives.",
      },
      {
        type: "puzzle",
        fen: "6k1/5ppp/8/8/8/8/8/R3K3 w - - 0 1",
        prompt: "Deliver checkmate on the back rank.",
        solution: ["a1a8"],
        explainCorrect: "Back-rank mate! The king's own pawns blocked every escape square.",
        explainWrong: "The black king's own pawns are blocking its escape squares. Bring your rook all the way to the back rank.",
      },
      {
        type: "concept",
        fen: "7k/6Q1/6K1/8/8/8/8/8 b - - 0 1",
        text: "A supported mate is when your attacking piece delivers check right next to the enemy king, protected by another one of your pieces so it can't simply be captured.",
      },
      {
        type: "puzzle",
        fen: "7k/Q7/5P2/8/8/8/8/4K3 w - - 0 1",
        prompt: "Deliver checkmate — your pawn on f6 has you covered.",
        solution: ["a7g7"],
        explainCorrect: "Checkmate! The queen can't be captured because your pawn defends her, and the king has no escape square.",
        explainWrong: "Bring the queen next to the king on a square your pawn defends, covering every escape square.",
      },
      {
        type: "concept",
        fen: START_FEN,
        text: "You've covered the fundamentals — how every piece moves, special rules, check and checkmate, and your first tactics. Head to Play mode and put it all into practice against the computer!",
      },
    ],
  },
];

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.id === id);
}

export function getLessonIndex(id: string): number {
  return LESSONS.findIndex((lesson) => lesson.id === id);
}

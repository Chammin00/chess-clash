export type GameThemeId =
  | 'ninjas'
  | 'samurais'
  | 'pirates'
  | 'animals'
  | 'sea_creatures'
  | 'cyber_mecha'
  | 'necropolis'
  | 'mythic_gods'
  | 'jurassic'
  | 'space_fleet';

export type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';

export type PlayerColor = 'white' | 'black';

export interface Position {
  row: number; // 0 to 7 (0 is rank 8, 7 is rank 1 from white perspective)
  col: number; // 0 to 7 (0 is 'a', 7 is 'h')
}

export interface ChessPiece {
  id: string;
  type: PieceType;
  color: PlayerColor;
  hasMoved?: boolean;
}

export interface Move {
  from: Position;
  to: Position;
  piece: ChessPiece;
  captured?: ChessPiece;
  isEnPassant?: boolean;
  isCastling?: 'kingside' | 'queenside';
  promotion?: PieceType;
  san: string; // Standard algebraic notation like "Nf3", "O-O", "e4", "Qxd7#"
  evaluation?: number;
}

export type GameStatus = 'ongoing' | 'check' | 'checkmate' | 'stalemate' | 'draw_material' | 'draw_repetition' | 'draw_agreement' | 'resigned';

export interface ThemePieceLore {
  title: string;
  icon: string; // Emoji / Symbol representation
  subtitle: string;
  specialAbility: string;
  description: string;
}

export interface ThemeConfig {
  id: GameThemeId;
  name: string;
  tagline: string;
  lore: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  lightSquareColor: string;
  darkSquareColor: string;
  highlightColor: string;
  attackHighlightColor: string;
  pieces: Record<PieceType, ThemePieceLore>;
  boardTextureName: string;
  factionBanner: string;
}

export type ChessEngineModelType = 'stockfish' | 'maia' | 'alphazero';

export interface ChessBotProfile {
  id: string;
  name: string;
  avatar: string;
  country: string;
  mmr: number;
  engine: ChessEngineModelType;
  targetDepth: number;
  blunderRate: number; // 0.0 (no blunders) to 0.40 (frequent blunders)
  playstyle: 'Aggressive' | 'Positional' | 'Tactical' | 'Swarm' | 'Defensive' | 'Adaptive';
  quote: string;
}

export type ChessRankTier =
  | 'Novice'
  | 'Bronze'
  | 'Silver'
  | 'Gold'
  | 'Platinum'
  | 'Diamond'
  | 'Master'
  | 'Grandmaster'
  | 'Stockfish God';

export interface GameThemeMMR {
  themeId: GameThemeId;
  mmr: number;
  tier: ChessRankTier;
  wins: number;
  losses: number;
  draws: number;
  streak: number;
  peakMmr: number;
}

export interface PlayerChessProfile {
  overallMmr: number;
  highestTier: ChessRankTier;
  totalGames: number;
  totalWins: number;
  themeStats: Record<GameThemeId, GameThemeMMR>;
  recentMatches: ChessMatchRecord[];
}

export interface ChessMatchRecord {
  id: string;
  themeId: GameThemeId;
  timestamp: number;
  opponentName: string;
  opponentMmr: number;
  opponentAvatar: string;
  result: 'win' | 'loss' | 'draw';
  mmrChange: number;
  newMmr: number;
  moveCount: number;
  engineType: ChessEngineModelType;
}

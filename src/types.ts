export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}
  
export interface GameResult {
  playerId: number;
  score: number;
  time: number; // in seconds
  date: Date;
  difficulty: '4x4' | '6x6' | '8x8';
  cardType: string;
}
  
export interface Settings {
  difficulty: '4x4' | '6x6' | '8x8';
  cardType: string;
}
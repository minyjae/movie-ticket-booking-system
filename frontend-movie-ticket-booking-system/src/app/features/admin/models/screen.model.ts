export interface Screen {
  id: string;
  name: string;
  vipRows: number;
  vipSeatsPerRow: number;
  normalRows: number;
  normalSeatsPerRow: number;
  totalVipSeats: number;
  totalNormalSeats: number;
  createdAt: string;
}

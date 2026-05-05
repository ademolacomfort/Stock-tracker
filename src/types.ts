export interface InventoryItem {
  id: string;
  name: string;
  qty: number;
  velocity: number; // Daily sales
}

export type StockStatus = 'Safe' | 'Warning' | 'Emergency' | 'Stable';

export interface Prediction {
  days: number;
  color: 'red' | 'orange' | 'green' | 'gray';
  label: StockStatus;
}

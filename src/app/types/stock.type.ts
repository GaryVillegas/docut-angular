export interface stockInfo {
  nombre: string;
  descripcion: string;
  cantidad: number;
  storeId: string;
}

export interface stockData {
  id: string;
  stockInfo: stockInfo;
}

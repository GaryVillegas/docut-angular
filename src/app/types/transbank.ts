export interface TransactionRequest {
  amount: number;
  sessionId: string;
  buyOrder: string;
}

export interface CreateTransactionResponse {
  success: string;
  token: string;
  url: string;
  message: string;
}

export interface ConfirmTransactionRequest {
  token: string;
}

export interface ConfirmTransactionResponse {
  success: string;
  transaction: transaction;
  message: string;
}

export interface transaction {
  vci: string;
  amount: number;
  status: string;
  buy_order: string;
  session_id: string;
  card_detail?: any;
  accounting_date: string;
  transaction_date: string;
  authorization_code: string;
  payment_type_code: string;
  response_code: number;
  installments_amount?: number;
  installments_number?: number;
  balance?: number;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
}

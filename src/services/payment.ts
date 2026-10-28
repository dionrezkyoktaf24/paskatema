export type PaymentStatus = "PENDING" | "PAID" | "CANCELLED";

export interface PaymentRequest {
  id: string;
  baseAmount: number;
  uniqueCode: number;
  totalAmount: number;
  description: string;
  payerName: string;
  status: PaymentStatus;
  expiresAt: string;
  createdAt: string;
  paidAt: string | null;
}

export interface AdminPaymentRequest extends PaymentRequest {
  payerContact: string | null;
  payer: { id: string; name: string; angkatan: number | null } | null;
  confirmedBy: { id: string; name: string } | null;
}

export function rupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

/** Status efektif: menunggu yang sudah lewat waktunya dianggap kedaluwarsa. */
export function effectiveStatus(p: PaymentRequest, now: number): PaymentStatus | "EXPIRED" {
  return p.status === "PENDING" && new Date(p.expiresAt).getTime() < now ? "EXPIRED" : p.status;
}

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus | "EXPIRED", string> = {
  PENDING: "Menunggu pembayaran",
  PAID: "Lunas",
  CANCELLED: "Dibatalkan",
  EXPIRED: "Kedaluwarsa",
};

import { z } from 'zod';

export const vendorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Vendor name is required'),
  aliases: z.array(z.string()).optional(),
});

export const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Product name is required'),
  aliases: z.array(z.string()).optional(),
  default_unit: z.string().optional(),
  category: z.string().optional(),
});

export const confidencesSchema = z.object({
  qty: z.number().min(0).max(1).optional(),
  unitPrice: z.number().min(0).max(1).optional(),
  lineTotal: z.number().min(0).max(1).optional(),
  description: z.number().min(0).max(1).optional(),
});

export const receiptLineSchema = z.object({
  id: z.string().uuid(),
  receiptId: z.string().uuid(),
  index: z.number().int().min(0),
  descriptionRaw: z.string().min(1, 'Description is required'),
  descriptionNorm: z.string().optional(),
  qty: z.number().min(0.001, 'Quantity must be positive'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  lineTotal: z.number(),
  unit: z.string().optional(),
  productId: z.string().uuid().optional(),
  confidences: confidencesSchema.optional(),
});

export const receiptSchema = z.object({
  id: z.string().uuid(),
  vendor: z.string().min(1, 'Vendor is required'),
  vendorId: z.string().uuid().optional(),
  dateTime: z.string().datetime(),
  receiptNo: z.string().optional(),
  currency: z.literal('MAD'),
  total: z.number().min(0),
  paid: z.number().min(0).optional(),
  change: z.number().optional(),
  balancePrev: z.number().optional(),
  balanceCurr: z.number().optional(),
  status: z.enum(['draft', 'verified']),
  confidenceOverall: z.number().min(0).max(1),
  imageUrl: z.string().optional(),
  ocrRaw: z.unknown().optional(),
  notes: z.string().optional(),
});

export const receiptFormSchema = receiptSchema.omit({ id: true }).partial({
  dateTime: true,
  total: true,
  status: true,
  confidenceOverall: true,
});

export const receiptLineFormSchema = receiptLineSchema.omit({ id: true, receiptId: true });

export type Vendor = z.infer<typeof vendorSchema>;
export type Product = z.infer<typeof productSchema>;
export type ReceiptLine = z.infer<typeof receiptLineSchema>;
export type Receipt = z.infer<typeof receiptSchema>;
export type ReceiptForm = z.infer<typeof receiptFormSchema>;
export type ReceiptLineForm = z.infer<typeof receiptLineFormSchema>;
export type Confidences = z.infer<typeof confidencesSchema>;

export interface ReceiptWithLines extends Receipt {
  lines: ReceiptLine[];
}

export interface ReceiptFilters {
  dateFrom?: string;
  dateTo?: string;
  vendors?: string[];
  status?: 'draft' | 'verified' | 'all';
  minTotal?: number;
  maxTotal?: number;
  search?: string;
  lowConfidence?: boolean;
}

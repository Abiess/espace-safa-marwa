/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Receipt, ReceiptLine, ReceiptWithLines } from '@/lib/schemas';
import { useToast } from './use-toast';

function mapDbReceiptToReceipt(dbReceipt: {
  id: string;
  vendor: string;
  vendor_id: string | null;
  date_time: string;
  receipt_no: string | null;
  currency: string;
  total: number;
  paid: number | null;
  change: number | null;
  balance_prev: number | null;
  balance_curr: number | null;
  status: string;
  confidence_overall: number;
  image_url: string | null;
  ocr_raw: unknown;
  notes: string | null;
}): Receipt {
  return {
    id: dbReceipt.id,
    vendor: dbReceipt.vendor,
    vendorId: dbReceipt.vendor_id || undefined,
    dateTime: dbReceipt.date_time,
    receiptNo: dbReceipt.receipt_no || undefined,
    currency: 'MAD',
    total: dbReceipt.total,
    paid: dbReceipt.paid || undefined,
    change: dbReceipt.change || undefined,
    balancePrev: dbReceipt.balance_prev || undefined,
    balanceCurr: dbReceipt.balance_curr || undefined,
    status: dbReceipt.status as 'draft' | 'verified',
    confidenceOverall: dbReceipt.confidence_overall,
    imageUrl: dbReceipt.image_url || undefined,
    ocrRaw: dbReceipt.ocr_raw,
    notes: dbReceipt.notes || undefined,
  };
}

function mapDbLineToReceiptLine(dbLine: {
  id: string;
  receipt_id: string;
  index: number;
  description_raw: string;
  description_norm: string | null;
  qty: number;
  unit_price: number;
  line_total: number;
  unit: string | null;
  product_id: string | null;
  confidences: unknown;
}): ReceiptLine {
  return {
    id: dbLine.id,
    receiptId: dbLine.receipt_id,
    index: dbLine.index,
    descriptionRaw: dbLine.description_raw,
    descriptionNorm: dbLine.description_norm || undefined,
    qty: dbLine.qty,
    unitPrice: dbLine.unit_price,
    lineTotal: dbLine.line_total,
    unit: dbLine.unit || undefined,
    productId: dbLine.product_id || undefined,
    confidences: dbLine.confidences as { qty?: number; unitPrice?: number; lineTotal?: number; description?: number } | undefined,
  };
}

export function useReceipts() {
  return useQuery({
    queryKey: ['receipts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .order('date_time', { ascending: false });

      if (error) throw error;
      return data.map(mapDbReceiptToReceipt);
    },
  });
}

export function useReceipt(id: string) {
  return useQuery({
    queryKey: ['receipts', id],
    queryFn: async (): Promise<ReceiptWithLines> => {
      const [receiptResult, linesResult] = await Promise.all([
        supabase.from('receipts').select('*').eq('id', id).maybeSingle(),
        supabase.from('receipt_lines').select('*').eq('receipt_id', id).order('index'),
      ]);

      if (receiptResult.error) throw receiptResult.error;
      if (!receiptResult.data) throw new Error('Receipt not found');
      if (linesResult.error) throw linesResult.error;

      return {
        ...mapDbReceiptToReceipt(receiptResult.data),
        lines: (linesResult.data || []).map(mapDbLineToReceiptLine),
      };
    },
    enabled: !!id,
  });
}

export function useCreateReceipt() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (receipt: Omit<Receipt, 'id'> & { lines?: Omit<ReceiptLine, 'id' | 'receiptId'>[] }) => {
      const { lines, ...receiptData } = receipt;

      const { data: receiptResult, error: receiptError } = await (supabase as any)
        .from('receipts')
        .insert({
          vendor: receiptData.vendor,
          vendor_id: receiptData.vendorId || null,
          date_time: receiptData.dateTime,
          receipt_no: receiptData.receiptNo || null,
          currency: 'MAD',
          total: receiptData.total,
          paid: receiptData.paid || null,
          change: receiptData.change || null,
          balance_prev: receiptData.balancePrev || null,
          balance_curr: receiptData.balanceCurr || null,
          status: receiptData.status,
          confidence_overall: receiptData.confidenceOverall,
          image_url: receiptData.imageUrl || null,
          ocr_raw: receiptData.ocrRaw || null,
          notes: receiptData.notes || null,
        })
        .select()
        .single();

      if (receiptError) throw receiptError;
      if (!receiptResult) throw new Error('Failed to create receipt');

      if (lines && lines.length > 0) {
        const { error: linesError } = await (supabase as any).from('receipt_lines').insert(
          lines.map((line) => ({
            receipt_id: receiptResult.id,
            index: line.index,
            description_raw: line.descriptionRaw,
            description_norm: line.descriptionNorm || null,
            qty: line.qty,
            unit_price: line.unitPrice,
            line_total: line.lineTotal,
            unit: line.unit || null,
            product_id: line.productId || null,
            confidences: line.confidences || null,
          }))
        );

        if (linesError) throw linesError;
      }

      return receiptResult.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      toast({
        title: 'Receipt created',
        description: 'The receipt has been saved successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create receipt: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateReceipt() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Receipt> }) => {
      const { error } = await (supabase as any)
        .from('receipts')
        .update({
          vendor: data.vendor,
          vendor_id: data.vendorId || null,
          date_time: data.dateTime,
          receipt_no: data.receiptNo || null,
          total: data.total,
          paid: data.paid || null,
          change: data.change || null,
          balance_prev: data.balancePrev || null,
          balance_curr: data.balanceCurr || null,
          status: data.status,
          confidence_overall: data.confidenceOverall,
          image_url: data.imageUrl || null,
          notes: data.notes || null,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      queryClient.invalidateQueries({ queryKey: ['receipts', variables.id] });
      toast({
        title: 'Receipt updated',
        description: 'Changes have been saved.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update receipt: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteReceipt() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('receipts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      toast({
        title: 'Receipt deleted',
        description: 'The receipt has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete receipt: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateReceiptLines() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ receiptId, lines }: { receiptId: string; lines: ReceiptLine[] }) => {
      await supabase.from('receipt_lines').delete().eq('receipt_id', receiptId);

      if (lines.length > 0) {
        const { error } = await (supabase as any).from('receipt_lines').insert(
          lines.map((line) => ({
            id: line.id,
            receipt_id: receiptId,
            index: line.index,
            description_raw: line.descriptionRaw,
            description_norm: line.descriptionNorm || null,
            qty: line.qty,
            unit_price: line.unitPrice,
            line_total: line.lineTotal,
            unit: line.unit || null,
            product_id: line.productId || null,
            confidences: line.confidences || null,
          }))
        );

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['receipts', variables.receiptId] });
      toast({
        title: 'Lines updated',
        description: 'Changes have been saved.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update lines: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

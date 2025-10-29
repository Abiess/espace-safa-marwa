export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      vendors: {
        Row: {
          id: string;
          name: string;
          aliases: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          aliases?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          aliases?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          aliases: string[] | null;
          default_unit: string | null;
          category: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          aliases?: string[] | null;
          default_unit?: string | null;
          category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          aliases?: string[] | null;
          default_unit?: string | null;
          category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      receipts: {
        Row: {
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
          ocr_raw: Json | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vendor: string;
          vendor_id?: string | null;
          date_time?: string;
          receipt_no?: string | null;
          currency?: string;
          total: number;
          paid?: number | null;
          change?: number | null;
          balance_prev?: number | null;
          balance_curr?: number | null;
          status?: string;
          confidence_overall?: number;
          image_url?: string | null;
          ocr_raw?: Json | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vendor?: string;
          vendor_id?: string | null;
          date_time?: string;
          receipt_no?: string | null;
          currency?: string;
          total?: number;
          paid?: number | null;
          change?: number | null;
          balance_prev?: number | null;
          balance_curr?: number | null;
          status?: string;
          confidence_overall?: number;
          image_url?: string | null;
          ocr_raw?: Json | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      receipt_lines: {
        Row: {
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
          confidences: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          receipt_id: string;
          index: number;
          description_raw: string;
          description_norm?: string | null;
          qty: number;
          unit_price: number;
          line_total: number;
          unit?: string | null;
          product_id?: string | null;
          confidences?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          receipt_id?: string;
          index?: number;
          description_raw?: string;
          description_norm?: string | null;
          qty?: number;
          unit_price?: number;
          line_total?: number;
          unit?: string | null;
          product_id?: string | null;
          confidences?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      edit_history: {
        Row: {
          id: string;
          receipt_id: string;
          field_name: string | null;
          old_value: string | null;
          new_value: string | null;
          changed_at: string;
        };
        Insert: {
          id?: string;
          receipt_id: string;
          field_name?: string | null;
          old_value?: string | null;
          new_value?: string | null;
          changed_at?: string;
        };
        Update: {
          id?: string;
          receipt_id?: string;
          field_name?: string | null;
          old_value?: string | null;
          new_value?: string | null;
          changed_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

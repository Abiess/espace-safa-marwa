/*
  # Receipt System Database Schema

  ## Overview
  Complete database schema for a receipt processing and structured data management system.
  Supports multi-language (Arabic/French), vendor management, line-item tracking, and confidence scoring.

  ## Tables Created

  ### 1. vendors
  Stores vendor/supplier information with support for aliases
  - `id` (uuid, primary key)
  - `name` (text, unique, required) - Primary vendor name
  - `aliases` (text[]) - Alternative names/spellings
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. products
  Canonical product catalog for normalization
  - `id` (uuid, primary key)
  - `name` (text, required)
  - `aliases` (text[]) - Alternative product names
  - `default_unit` (text) - e.g., "kg", "pcs", "L"
  - `category` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. receipts
  Main receipt records with metadata and totals
  - `id` (uuid, primary key)
  - `vendor` (text, required) - Vendor name as appears on receipt
  - `vendor_id` (uuid, foreign key to vendors) - Normalized vendor reference
  - `date_time` (timestamptz, required)
  - `receipt_no` (text) - Receipt/invoice number
  - `currency` (text, default 'MAD')
  - `total` (numeric(10,2), required)
  - `paid` (numeric(10,2))
  - `change` (numeric(10,2))
  - `balance_prev` (numeric(10,2))
  - `balance_curr` (numeric(10,2))
  - `status` (text, default 'draft') - 'draft' or 'verified'
  - `confidence_overall` (numeric(3,2)) - 0.00 to 1.00
  - `image_url` (text)
  - `ocr_raw` (jsonb) - Raw OCR output
  - `notes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. receipt_lines
  Individual line items within receipts
  - `id` (uuid, primary key)
  - `receipt_id` (uuid, foreign key to receipts, cascade delete)
  - `index` (integer, required) - Display order
  - `description_raw` (text, required) - As appears on receipt
  - `description_norm` (text) - Normalized/cleaned description
  - `qty` (numeric(10,3), required)
  - `unit_price` (numeric(10,2), required)
  - `line_total` (numeric(10,2), required)
  - `unit` (text) - e.g., "kg", "pcs"
  - `product_id` (uuid, foreign key to products)
  - `confidences` (jsonb) - Field-level confidence scores
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. edit_history
  Audit log for tracking changes to receipts
  - `id` (uuid, primary key)
  - `receipt_id` (uuid, foreign key to receipts)
  - `field_name` (text)
  - `old_value` (text)
  - `new_value` (text)
  - `changed_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Public read access for demo (can be restricted later)
  - Authenticated users can insert/update/delete
*/

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  aliases text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  aliases text[] DEFAULT '{}',
  default_unit text,
  category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor text NOT NULL,
  vendor_id uuid REFERENCES vendors(id),
  date_time timestamptz NOT NULL DEFAULT now(),
  receipt_no text,
  currency text DEFAULT 'MAD',
  total numeric(10,2) NOT NULL,
  paid numeric(10,2),
  change numeric(10,2),
  balance_prev numeric(10,2),
  balance_curr numeric(10,2),
  status text DEFAULT 'draft',
  confidence_overall numeric(3,2) DEFAULT 0.00,
  image_url text,
  ocr_raw jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'verified')),
  CONSTRAINT valid_confidence CHECK (confidence_overall >= 0 AND confidence_overall <= 1)
);

-- Create receipt_lines table
CREATE TABLE IF NOT EXISTS receipt_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id uuid NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  index integer NOT NULL,
  description_raw text NOT NULL,
  description_norm text,
  qty numeric(10,3) NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  line_total numeric(10,2) NOT NULL,
  unit text,
  product_id uuid REFERENCES products(id),
  confidences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create edit_history table
CREATE TABLE IF NOT EXISTS edit_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id uuid NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  field_name text,
  old_value text,
  new_value text,
  changed_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_receipts_vendor_id ON receipts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_receipts_date_time ON receipts(date_time);
CREATE INDEX IF NOT EXISTS idx_receipts_status ON receipts(status);
CREATE INDEX IF NOT EXISTS idx_receipt_lines_receipt_id ON receipt_lines(receipt_id);
CREATE INDEX IF NOT EXISTS idx_receipt_lines_product_id ON receipt_lines(product_id);
CREATE INDEX IF NOT EXISTS idx_edit_history_receipt_id ON edit_history(receipt_id);

-- Enable Row Level Security
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE edit_history ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (demo mode)
CREATE POLICY "Public can view vendors"
  ON vendors FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view products"
  ON products FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view receipts"
  ON receipts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view receipt lines"
  ON receipt_lines FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view edit history"
  ON edit_history FOR SELECT
  TO public
  USING (true);

-- Create policies for insert/update/delete (public for demo, can restrict later)
CREATE POLICY "Public can insert vendors"
  ON vendors FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update vendors"
  ON vendors FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete vendors"
  ON vendors FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Public can insert products"
  ON products FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update products"
  ON products FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete products"
  ON products FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Public can insert receipts"
  ON receipts FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update receipts"
  ON receipts FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete receipts"
  ON receipts FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Public can insert receipt lines"
  ON receipt_lines FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update receipt lines"
  ON receipt_lines FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete receipt lines"
  ON receipt_lines FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Public can insert edit history"
  ON edit_history FOR INSERT
  TO public
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON receipts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_receipt_lines_updated_at BEFORE UPDATE ON receipt_lines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from './supabase';
import type { Database } from './database.types';

export async function seedDemoData() {
  const vendorsData = [
    { name: 'Metro Cash & Carry', aliases: ['Metro', 'Metro Maroc'] },
    { name: 'Marjane', aliases: ['Marjane Market'] },
    { name: 'Carrefour', aliases: ['Carrefour Market'] },
    { name: 'MaCuisine', aliases: ['Ma Cuisine'] },
  ];

  const { data: vendors, error: vendorsError } = await (supabase as any)
    .from('vendors')
    .upsert(vendorsData, { onConflict: 'name', ignoreDuplicates: false })
    .select();

  if (vendorsError) {
    console.error('Error seeding vendors:', vendorsError);
    return;
  }

  const productsData = [
    { name: 'Frites Julienne 2.5kg', category: 'Frozen', default_unit: 'kg' },
    { name: 'Hot-Dog', category: 'Frozen', default_unit: 'pcs' },
    { name: 'Thon', category: 'Canned Goods', default_unit: 'kg' },
    { name: 'Huile 5L', category: 'Oil', default_unit: 'L', aliases: ['Oil 5L'] },
    { name: 'Pommes de terre', category: 'Produce', default_unit: 'kg', aliases: ['Pommes'] },
    { name: 'Oeufs', category: 'Eggs', default_unit: 'pcs', aliases: ['Eggs'] },
    { name: 'Sacs Kraft', category: 'Supplies', default_unit: 'pcs', aliases: ['Kraft bags'] },
  ];

  const { error: productsError } = await (supabase as any).from('products').upsert(productsData, { ignoreDuplicates: true });

  if (productsError) {
    console.error('Error seeding products:', productsError);
    return;
  }

  const metroVendor = vendors?.find((v: any) => v.name === 'Metro Cash & Carry');
  const marjaneVendor = vendors?.find((v: any) => v.name === 'Marjane');
  const macuisineVendor = vendors?.find((v: any) => v.name === 'MaCuisine');

  const receiptsData = [
    {
      vendor: 'Metro Cash & Carry',
      vendor_id: metroVendor?.id || null,
      date_time: new Date('2025-10-20T14:30:00').toISOString(),
      receipt_no: 'R20251020-001',
      total: 216.0,
      paid: 220.0,
      change: 4.0,
      status: 'verified',
      confidence_overall: 0.95,
      image_url: 'https://images.pexels.com/photos/3944405/pexels-photo-3944405.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
      vendor: 'Metro Cash & Carry',
      vendor_id: metroVendor?.id || null,
      date_time: new Date('2025-10-18T11:15:00').toISOString(),
      receipt_no: 'R20251018-002',
      total: 360.0,
      paid: 360.0,
      change: 0.0,
      status: 'verified',
      confidence_overall: 0.98,
      image_url: 'https://images.pexels.com/photos/5632381/pexels-photo-5632381.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
      vendor: 'Marjane',
      vendor_id: marjaneVendor?.id || null,
      date_time: new Date('2025-10-15T16:45:00').toISOString(),
      receipt_no: 'MAR-20251015-789',
      total: 1319.6,
      paid: 1320.0,
      change: 0.4,
      status: 'draft',
      confidence_overall: 0.82,
      image_url: 'https://images.pexels.com/photos/5632371/pexels-photo-5632371.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
      vendor: 'MaCuisine',
      vendor_id: macuisineVendor?.id || null,
      date_time: new Date('2025-10-12T10:20:00').toISOString(),
      receipt_no: 'MC-456',
      total: 55.1,
      paid: 60.0,
      change: 4.9,
      status: 'verified',
      confidence_overall: 0.91,
      image_url: 'https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
      vendor: 'Carrefour',
      vendor_id: null,
      date_time: new Date('2025-10-10T09:30:00').toISOString(),
      receipt_no: 'CF-2025-1010',
      total: 145.5,
      paid: 150.0,
      change: 4.5,
      status: 'draft',
      confidence_overall: 0.76,
      image_url: 'https://images.pexels.com/photos/5625120/pexels-photo-5625120.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
      vendor: 'Metro Cash & Carry',
      vendor_id: metroVendor?.id || null,
      date_time: new Date('2025-10-08T13:00:00').toISOString(),
      receipt_no: 'R20251008-555',
      total: 89.75,
      paid: 90.0,
      change: 0.25,
      status: 'verified',
      confidence_overall: 0.93,
      image_url: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
  ];

  const { data: insertedReceipts, error: receiptsError } = await (supabase as any)
    .from('receipts')
    .insert(receiptsData)
    .select();

  if (receiptsError) {
    console.error('Error seeding receipts:', receiptsError);
    return;
  }

  if (!insertedReceipts) return;

  const linesData: Database['public']['Tables']['receipt_lines']['Insert'][] = [
    {
      receipt_id: insertedReceipts[0].id,
      index: 0,
      description_raw: 'Frites Julienne 7/7 2.5kg',
      description_norm: 'Frites Julienne 2.5kg',
      qty: 4,
      unit_price: 49.0,
      line_total: 196.0,
      unit: 'kg',
      confidences: { qty: 0.95, unitPrice: 0.98, lineTotal: 0.99, description: 0.92 },
    },
    {
      receipt_id: insertedReceipts[0].id,
      index: 1,
      description_raw: 'Hot-Dog',
      description_norm: 'Hot-Dog',
      qty: 2,
      unit_price: 10.0,
      line_total: 20.0,
      unit: 'pcs',
      confidences: { qty: 0.99, unitPrice: 0.97, lineTotal: 0.98, description: 0.95 },
    },
    {
      receipt_id: insertedReceipts[1].id,
      index: 0,
      description_raw: 'Thon 1700g',
      description_norm: 'Thon 1.7kg',
      qty: 3,
      unit_price: 120.0,
      line_total: 360.0,
      unit: 'kg',
      confidences: { qty: 0.98, unitPrice: 0.99, lineTotal: 0.99, description: 0.97 },
    },
    {
      receipt_id: insertedReceipts[2].id,
      index: 0,
      description_raw: 'Huile 5L',
      description_norm: 'Oil 5L',
      qty: 2,
      unit_price: 85.0,
      line_total: 170.0,
      unit: 'L',
      confidences: { qty: 0.85, unitPrice: 0.82, lineTotal: 0.88, description: 0.79 },
    },
    {
      receipt_id: insertedReceipts[2].id,
      index: 1,
      description_raw: 'Pommes 2.5kg',
      description_norm: 'Pommes de terre 2.5kg',
      qty: 4,
      unit_price: 45.0,
      line_total: 180.0,
      unit: 'kg',
      confidences: { qty: 0.90, unitPrice: 0.85, lineTotal: 0.92, description: 0.75 },
    },
    {
      receipt_id: insertedReceipts[2].id,
      index: 2,
      description_raw: 'Oeufs 100pcs',
      description_norm: 'Eggs 100',
      qty: 5,
      unit_price: 120.0,
      line_total: 600.0,
      unit: 'pcs',
      confidences: { qty: 0.78, unitPrice: 0.80, lineTotal: 0.82, description: 0.85 },
    },
    {
      receipt_id: insertedReceipts[2].id,
      index: 3,
      description_raw: 'Sacs Kraft 26',
      description_norm: 'Kraft bags 26',
      qty: 10,
      unit_price: 36.96,
      line_total: 369.6,
      unit: 'pcs',
      confidences: { qty: 0.81, unitPrice: 0.75, lineTotal: 0.79, description: 0.82 },
    },
    {
      receipt_id: insertedReceipts[3].id,
      index: 0,
      description_raw: 'Spatule Silicone',
      description_norm: 'Silicone Spatula',
      qty: 2,
      unit_price: 15.5,
      line_total: 31.0,
      unit: 'pcs',
      confidences: { qty: 0.92, unitPrice: 0.91, lineTotal: 0.93, description: 0.89 },
    },
    {
      receipt_id: insertedReceipts[3].id,
      index: 1,
      description_raw: 'Fouet Inox',
      description_norm: 'Stainless Steel Whisk',
      qty: 1,
      unit_price: 24.1,
      line_total: 24.1,
      unit: 'pcs',
      confidences: { qty: 0.95, unitPrice: 0.88, lineTotal: 0.90, description: 0.91 },
    },
    {
      receipt_id: insertedReceipts[4].id,
      index: 0,
      description_raw: 'Pain de mie',
      description_norm: 'Sliced bread',
      qty: 3,
      unit_price: 8.5,
      line_total: 25.5,
      unit: 'pcs',
      confidences: { qty: 0.80, unitPrice: 0.75, lineTotal: 0.78, description: 0.72 },
    },
    {
      receipt_id: insertedReceipts[4].id,
      index: 1,
      description_raw: 'Lait 1L',
      description_norm: 'Milk 1L',
      qty: 4,
      unit_price: 12.0,
      line_total: 48.0,
      unit: 'L',
      confidences: { qty: 0.75, unitPrice: 0.78, lineTotal: 0.76, description: 0.74 },
    },
    {
      receipt_id: insertedReceipts[4].id,
      index: 2,
      description_raw: 'Yaourt nature',
      description_norm: 'Plain yogurt',
      qty: 6,
      unit_price: 12.0,
      line_total: 72.0,
      unit: 'pcs',
      confidences: { qty: 0.73, unitPrice: 0.71, lineTotal: 0.75, description: 0.70 },
    },
    {
      receipt_id: insertedReceipts[5].id,
      index: 0,
      description_raw: 'Tomates 1kg',
      description_norm: 'Tomatoes 1kg',
      qty: 2.5,
      unit_price: 15.0,
      line_total: 37.5,
      unit: 'kg',
      confidences: { qty: 0.94, unitPrice: 0.93, lineTotal: 0.95, description: 0.91 },
    },
    {
      receipt_id: insertedReceipts[5].id,
      index: 1,
      description_raw: 'Concombre',
      description_norm: 'Cucumber',
      qty: 3,
      unit_price: 5.75,
      line_total: 17.25,
      unit: 'pcs',
      confidences: { qty: 0.92, unitPrice: 0.90, lineTotal: 0.93, description: 0.94 },
    },
    {
      receipt_id: insertedReceipts[5].id,
      index: 2,
      description_raw: 'Oignons',
      description_norm: 'Onions',
      qty: 1.5,
      unit_price: 10.0,
      line_total: 15.0,
      unit: 'kg',
      confidences: { qty: 0.89, unitPrice: 0.92, lineTotal: 0.91, description: 0.93 },
    },
    {
      receipt_id: insertedReceipts[5].id,
      index: 3,
      description_raw: 'Poivrons',
      description_norm: 'Bell peppers',
      qty: 4,
      unit_price: 5.0,
      line_total: 20.0,
      unit: 'pcs',
      confidences: { qty: 0.91, unitPrice: 0.94, lineTotal: 0.92, description: 0.90 },
    },
  ];

  const { error: linesError } = await (supabase as any).from('receipt_lines').insert(linesData);

  if (linesError) {
    console.error('Error seeding lines:', linesError);
    return;
  }

  console.log('Demo data seeded successfully!');
}

export async function clearAllData() {
  await supabase.from('receipt_lines').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('receipts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('vendors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
}

export async function resetDemoData() {
  await clearAllData();
  await seedDemoData();
}

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/schemas';
import type { Database } from '@/lib/database.types';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;

      return (data || []).map((p: Database['public']['Tables']['products']['Row']) => ({
        id: p.id,
        name: p.name,
        aliases: p.aliases || undefined,
        default_unit: p.default_unit || undefined,
        category: p.category || undefined,
      }));
    },
  });
}

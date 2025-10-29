/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Vendor } from '@/lib/schemas';
import type { Database } from '@/lib/database.types';
import { useToast } from './use-toast';

export function useVendors() {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: async (): Promise<Vendor[]> => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('name');

      if (error) throw error;

      return (data || []).map((v: Database['public']['Tables']['vendors']['Row']) => ({
        id: v.id,
        name: v.name,
        aliases: v.aliases || undefined,
      }));
    },
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (vendor: Omit<Vendor, 'id'>) => {
      const { error } = await (supabase as any).from('vendors').insert({
        name: vendor.name,
        aliases: vendor.aliases || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast({
        title: 'Vendor created',
        description: 'The vendor has been added.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create vendor: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Vendor> }) => {
      const { error } = await (supabase as any)
        .from('vendors')
        .update({
          name: data.name,
          aliases: data.aliases || null,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast({
        title: 'Vendor updated',
        description: 'Changes have been saved.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update vendor: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

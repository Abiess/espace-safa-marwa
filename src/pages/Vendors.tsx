import { useState } from 'react';
import { Plus, Edit } from 'lucide-react';
import { useVendors, useCreateVendor, useUpdateVendor } from '@/hooks/use-vendors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

export function Vendors() {
  const { data: vendors = [], isLoading } = useVendors();
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();

  const [isOpen, setIsOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<{ id?: string; name: string; aliases: string[] } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVendor) return;

    if (editingVendor.id) {
      await updateVendor.mutateAsync({
        id: editingVendor.id,
        data: {
          name: editingVendor.name,
          aliases: editingVendor.aliases.filter((a) => a.trim()),
        },
      });
    } else {
      await createVendor.mutateAsync({
        name: editingVendor.name,
        aliases: editingVendor.aliases.filter((a) => a.trim()),
      });
    }

    setIsOpen(false);
    setEditingVendor(null);
  };

  const handleAddAlias = () => {
    if (!editingVendor) return;
    setEditingVendor({
      ...editingVendor,
      aliases: [...editingVendor.aliases, ''],
    });
  };

  const handleUpdateAlias = (index: number, value: string) => {
    if (!editingVendor) return;
    const newAliases = [...editingVendor.aliases];
    newAliases[index] = value;
    setEditingVendor({ ...editingVendor, aliases: newAliases });
  };

  const handleRemoveAlias = (index: number) => {
    if (!editingVendor) return;
    setEditingVendor({
      ...editingVendor,
      aliases: editingVendor.aliases.filter((_, i) => i !== index),
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Vendors</h1>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              onClick={() => {
                setEditingVendor({ name: '', aliases: [] });
                setIsOpen(true);
              }}
              className="gap-2"
            >
              <Plus size={16} />
              Add Vendor
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{editingVendor?.id ? 'Edit Vendor' : 'Add Vendor'}</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label>Vendor Name *</Label>
                <Input
                  value={editingVendor?.name || ''}
                  onChange={(e) =>
                    setEditingVendor(editingVendor ? { ...editingVendor, name: e.target.value } : null)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Aliases</Label>
                  <Button type="button" size="sm" variant="outline" onClick={handleAddAlias}>
                    <Plus size={14} />
                  </Button>
                </div>
                <div className="space-y-2">
                  {editingVendor?.aliases.map((alias, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={alias}
                        onChange={(e) => handleUpdateAlias(index, e.target.value)}
                        placeholder="Alias name"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => handleRemoveAlias(index)}
                      >
                        <Plus size={14} className="rotate-45" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full">
                {editingVendor?.id ? 'Update' : 'Create'}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vendors.map((vendor) => (
          <Card key={vendor.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">{vendor.name}</CardTitle>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setEditingVendor({
                    id: vendor.id,
                    name: vendor.name,
                    aliases: vendor.aliases || [],
                  });
                  setIsOpen(true);
                }}
              >
                <Edit size={16} />
              </Button>
            </CardHeader>
            <CardContent>
              {vendor.aliases && vendor.aliases.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {vendor.aliases.map((alias, index) => (
                    <Badge key={index} variant="secondary">
                      {alias}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No aliases</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

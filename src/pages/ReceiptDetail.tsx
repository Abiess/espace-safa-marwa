import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { useReceipt, useUpdateReceipt, useUpdateReceiptLines } from '@/hooks/use-receipts';
import { useVendors } from '@/hooks/use-vendors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EditableGrid } from '@/components/EditableGrid';
import { Textarea } from '@/components/ui/textarea';
import { exportReceiptLinesToCSV, exportReceiptToJSON } from '@/lib/export';
import { formatCurrency } from '@/lib/format';
import type { ReceiptLine, ReceiptWithLines } from '@/lib/schemas';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ReceiptDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: receipt, isLoading } = useReceipt(id!);
  const { data: vendors = [] } = useVendors();
  const updateReceipt = useUpdateReceipt();
  const updateLines = useUpdateReceiptLines();

  const [editedReceipt, setEditedReceipt] = useState<ReceiptWithLines | null>(null);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (receipt) {
      setEditedReceipt(receipt);
    }
  }, [receipt]);

  if (isLoading || !editedReceipt) {
    return <div className="p-8">Loading...</div>;
  }

  const handleSave = async () => {
    await updateReceipt.mutateAsync({
      id: editedReceipt.id,
      data: {
        vendor: editedReceipt.vendor,
        vendorId: editedReceipt.vendorId,
        dateTime: editedReceipt.dateTime,
        receiptNo: editedReceipt.receiptNo,
        total: editedReceipt.total,
        paid: editedReceipt.paid,
        change: editedReceipt.change,
        status: editedReceipt.status,
        notes: editedReceipt.notes,
      },
    });

    await updateLines.mutateAsync({
      receiptId: editedReceipt.id,
      lines: editedReceipt.lines,
    });
  };

  const handleMarkVerified = async () => {
    setEditedReceipt({ ...editedReceipt, status: 'verified' });
    await updateReceipt.mutateAsync({
      id: editedReceipt.id,
      data: { status: 'verified' },
    });
  };

  const linesTotal = editedReceipt.lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const totalDiff = Math.abs(linesTotal - editedReceipt.total);
  const hasTotalMismatch = totalDiff > 0.5;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
          <ArrowLeft size={16} />
          Back to Dashboard
        </Button>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download size={16} />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => exportReceiptLinesToCSV(editedReceipt.lines, editedReceipt.id)}>
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportReceiptToJSON(editedReceipt)}>
                Export JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {editedReceipt.status === 'draft' && (
            <Button onClick={handleMarkVerified} className="gap-2">
              <CheckCircle size={16} />
              Mark Verified
            </Button>
          )}
          <Button onClick={handleSave} className="gap-2">
            <Save size={16} />
            Save
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receipt Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Vendor</Label>
              <Select
                value={editedReceipt.vendor}
                onValueChange={(value) => {
                  const vendor = vendors.find((v) => v.name === value);
                  setEditedReceipt({
                    ...editedReceipt,
                    vendor: value,
                    vendorId: vendor?.id,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.name}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date & Time</Label>
              <Input
                type="datetime-local"
                value={editedReceipt.dateTime.slice(0, 16)}
                onChange={(e) =>
                  setEditedReceipt({
                    ...editedReceipt,
                    dateTime: new Date(e.target.value).toISOString(),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Receipt No</Label>
              <Input
                value={editedReceipt.receiptNo || ''}
                onChange={(e) =>
                  setEditedReceipt({ ...editedReceipt, receiptNo: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Total (MAD)</Label>
              <Input
                type="number"
                step="0.01"
                value={editedReceipt.total}
                onChange={(e) =>
                  setEditedReceipt({ ...editedReceipt, total: parseFloat(e.target.value) || 0 })
                }
                className={hasTotalMismatch ? 'border-destructive' : ''}
              />
              {hasTotalMismatch && (
                <p className="text-sm text-destructive">
                  Lines total: {formatCurrency(linesTotal)} (diff: {formatCurrency(totalDiff)})
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Paid (MAD)</Label>
              <Input
                type="number"
                step="0.01"
                value={editedReceipt.paid || ''}
                onChange={(e) =>
                  setEditedReceipt({ ...editedReceipt, paid: parseFloat(e.target.value) || undefined })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Change (MAD)</Label>
              <Input
                type="number"
                step="0.01"
                value={editedReceipt.change || ''}
                onChange={(e) =>
                  setEditedReceipt({ ...editedReceipt, change: parseFloat(e.target.value) || undefined })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <div>
                <Badge variant={editedReceipt.status === 'verified' ? 'default' : 'secondary'}>
                  {editedReceipt.status}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Confidence</Label>
              <div>
                <Badge
                  variant={
                    editedReceipt.confidenceOverall >= 0.9
                      ? 'default'
                      : editedReceipt.confidenceOverall >= 0.75
                      ? 'secondary'
                      : 'destructive'
                  }
                >
                  {(editedReceipt.confidenceOverall * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Receipt Image</CardTitle>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setZoom(Math.max(50, zoom - 10))}
              >
                <ZoomOut size={16} />
              </Button>
              <span className="text-sm self-center">{zoom}%</span>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setZoom(Math.min(200, zoom + 10))}
              >
                <ZoomIn size={16} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[600px]">
              {editedReceipt.imageUrl ? (
                <img
                  src={editedReceipt.imageUrl}
                  alt="Receipt"
                  style={{ width: `${zoom}%` }}
                  className="rounded-lg"
                />
              ) : (
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  No image available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Info</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="notes">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="ocr">OCR Raw</TabsTrigger>
              </TabsList>
              <TabsContent value="notes" className="space-y-4">
                <Textarea
                  placeholder="Add notes about this receipt..."
                  value={editedReceipt.notes || ''}
                  onChange={(e) =>
                    setEditedReceipt({ ...editedReceipt, notes: e.target.value })
                  }
                  rows={10}
                />
              </TabsContent>
              <TabsContent value="ocr">
                <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-[400px]">
                  {editedReceipt.ocrRaw
                    ? JSON.stringify(editedReceipt.ocrRaw, null, 2)
                    : 'No OCR data available'}
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line Items ({editedReceipt.lines.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <EditableGrid
            lines={editedReceipt.lines}
            onChange={(newLines: ReceiptLine[]) =>
              setEditedReceipt({ ...editedReceipt, lines: newLines })
            }
          />
          <div className="mt-4 flex justify-end">
            <div className="text-right space-y-2">
              <div className="flex justify-between gap-8">
                <span className="font-semibold">Lines Total:</span>
                <span>{formatCurrency(linesTotal)}</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="font-semibold">Receipt Total:</span>
                <span className={hasTotalMismatch ? 'text-destructive' : ''}>
                  {formatCurrency(editedReceipt.total)}
                </span>
              </div>
              {hasTotalMismatch && (
                <div className="text-sm text-destructive">
                  Difference: {formatCurrency(totalDiff)}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

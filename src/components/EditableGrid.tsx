import { useState, useCallback, KeyboardEvent } from 'react';
import { Plus, Trash2, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ConfidenceChip } from './ConfidenceChip';
import type { ReceiptLine } from '@/lib/schemas';
import { cn } from '@/lib/utils';

interface EditableGridProps {
  lines: ReceiptLine[];
  onChange: (lines: ReceiptLine[]) => void;
}

export function EditableGrid({ lines, onChange }: EditableGridProps) {
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; field: keyof ReceiptLine } | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const updateLine = useCallback(
    (index: number, field: keyof ReceiptLine, value: string | number) => {
      const newLines = [...lines];
      const line = { ...newLines[index] };

      if (field === 'qty' || field === 'unitPrice') {
        const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
        line[field] = numValue;
        line.lineTotal = line.qty * line.unitPrice;
      } else if (field === 'lineTotal') {
        line[field] = typeof value === 'string' ? parseFloat(value) || 0 : value;
      } else {
        line[field] = value as never;
      }

      newLines[index] = line;
      onChange(newLines);
    },
    [lines, onChange]
  );

  const addLine = useCallback(() => {
    const newLine: ReceiptLine = {
      id: crypto.randomUUID(),
      receiptId: lines[0]?.receiptId || '',
      index: lines.length,
      descriptionRaw: '',
      qty: 1,
      unitPrice: 0,
      lineTotal: 0,
    };
    onChange([...lines, newLine]);
  }, [lines, onChange]);

  const deleteLine = useCallback(
    (index: number) => {
      const newLines = lines.filter((_, i) => i !== index).map((line, i) => ({ ...line, index: i }));
      onChange(newLines);
      setSelectedRows(new Set());
    },
    [lines, onChange]
  );

  const duplicateLine = useCallback(
    (index: number) => {
      const lineToCopy = lines[index];
      const newLine: ReceiptLine = {
        ...lineToCopy,
        id: crypto.randomUUID(),
        index: lines.length,
      };
      onChange([...lines, newLine]);
    },
    [lines, onChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>, rowIndex: number, field: keyof ReceiptLine) => {
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        setEditingCell(null);

        const fields: (keyof ReceiptLine)[] = ['descriptionRaw', 'qty', 'unitPrice', 'lineTotal', 'unit'];
        const currentFieldIndex = fields.indexOf(field);
        const nextFieldIndex = (currentFieldIndex + 1) % fields.length;
        const nextRowIndex = nextFieldIndex === 0 ? rowIndex + 1 : rowIndex;

        if (nextRowIndex < lines.length) {
          setEditingCell({ rowIndex: nextRowIndex, field: fields[nextFieldIndex] });
        }
      } else if (e.key === 'Escape') {
        setEditingCell(null);
      }
    },
    [lines.length]
  );

  const toggleRowSelection = useCallback((index: number) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const deleteSelected = useCallback(() => {
    const newLines = lines
      .filter((_, i) => !selectedRows.has(i))
      .map((line, i) => ({ ...line, index: i }));
    onChange(newLines);
    setSelectedRows(new Set());
  }, [lines, selectedRows, onChange]);

  const hasMathError = useCallback((line: ReceiptLine) => {
    return Math.abs(line.qty * line.unitPrice - line.lineTotal) > 0.01;
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={addLine} size="sm" className="gap-2">
          <Plus size={16} />
          Add Line
        </Button>
        {selectedRows.size > 0 && (
          <Button onClick={deleteSelected} size="sm" variant="destructive" className="gap-2">
            <Trash2 size={16} />
            Delete Selected ({selectedRows.size})
          </Button>
        )}
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead className="w-12">#</TableHead>
              <TableHead className="min-w-[200px]">Description</TableHead>
              <TableHead className="w-24">Qty</TableHead>
              <TableHead className="w-32">Unit Price</TableHead>
              <TableHead className="w-32">Line Total</TableHead>
              <TableHead className="w-24">Unit</TableHead>
              <TableHead className="w-24">Conf.</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((line, rowIndex) => {
              const mathError = hasMathError(line);

              return (
                <TableRow key={line.id} className={cn(selectedRows.has(rowIndex) && 'bg-accent')}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedRows.has(rowIndex)}
                      onChange={() => toggleRowSelection(rowIndex)}
                      className="cursor-pointer"
                    />
                  </TableCell>
                  <TableCell>{rowIndex + 1}</TableCell>
                  <TableCell>
                    {editingCell?.rowIndex === rowIndex && editingCell.field === 'descriptionRaw' ? (
                      <Input
                        autoFocus
                        value={line.descriptionRaw}
                        onChange={(e) => updateLine(rowIndex, 'descriptionRaw', e.target.value)}
                        onBlur={() => setEditingCell(null)}
                        onKeyDown={(e) => handleKeyDown(e, rowIndex, 'descriptionRaw')}
                        className="h-8"
                      />
                    ) : (
                      <div
                        className="cursor-pointer hover:bg-accent p-1 rounded"
                        onClick={() => setEditingCell({ rowIndex, field: 'descriptionRaw' })}
                      >
                        {line.descriptionRaw || '-'}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingCell?.rowIndex === rowIndex && editingCell.field === 'qty' ? (
                      <Input
                        type="number"
                        autoFocus
                        step="0.001"
                        value={line.qty}
                        onChange={(e) => updateLine(rowIndex, 'qty', e.target.value)}
                        onBlur={() => setEditingCell(null)}
                        onKeyDown={(e) => handleKeyDown(e, rowIndex, 'qty')}
                        className="h-8"
                      />
                    ) : (
                      <div
                        className="cursor-pointer hover:bg-accent p-1 rounded"
                        onClick={() => setEditingCell({ rowIndex, field: 'qty' })}
                      >
                        {line.qty}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingCell?.rowIndex === rowIndex && editingCell.field === 'unitPrice' ? (
                      <Input
                        type="number"
                        autoFocus
                        step="0.01"
                        value={line.unitPrice}
                        onChange={(e) => updateLine(rowIndex, 'unitPrice', e.target.value)}
                        onBlur={() => setEditingCell(null)}
                        onKeyDown={(e) => handleKeyDown(e, rowIndex, 'unitPrice')}
                        className="h-8"
                      />
                    ) : (
                      <div
                        className="cursor-pointer hover:bg-accent p-1 rounded"
                        onClick={() => setEditingCell({ rowIndex, field: 'unitPrice' })}
                      >
                        {line.unitPrice.toFixed(2)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingCell?.rowIndex === rowIndex && editingCell.field === 'lineTotal' ? (
                      <Input
                        type="number"
                        autoFocus
                        step="0.01"
                        value={line.lineTotal}
                        onChange={(e) => updateLine(rowIndex, 'lineTotal', e.target.value)}
                        onBlur={() => setEditingCell(null)}
                        onKeyDown={(e) => handleKeyDown(e, rowIndex, 'lineTotal')}
                        className={cn('h-8', mathError && 'border-destructive')}
                      />
                    ) : (
                      <div
                        className={cn(
                          'cursor-pointer hover:bg-accent p-1 rounded',
                          mathError && 'text-destructive font-semibold'
                        )}
                        onClick={() => setEditingCell({ rowIndex, field: 'lineTotal' })}
                      >
                        {line.lineTotal.toFixed(2)}
                        {mathError && ' ⚠'}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingCell?.rowIndex === rowIndex && editingCell.field === 'unit' ? (
                      <Input
                        autoFocus
                        value={line.unit || ''}
                        onChange={(e) => updateLine(rowIndex, 'unit', e.target.value)}
                        onBlur={() => setEditingCell(null)}
                        onKeyDown={(e) => handleKeyDown(e, rowIndex, 'unit')}
                        className="h-8"
                      />
                    ) : (
                      <div
                        className="cursor-pointer hover:bg-accent p-1 rounded"
                        onClick={() => setEditingCell({ rowIndex, field: 'unit' })}
                      >
                        {line.unit || '-'}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {line.confidences?.description !== undefined && (
                      <ConfidenceChip value={line.confidences.description} size="sm" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => duplicateLine(rowIndex)}
                      >
                        <Copy size={14} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => deleteLine(rowIndex)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Click any cell to edit. Use Tab/Enter to move to next field, Esc to cancel.</p>
        <p className="text-destructive">
          ⚠ = Math validation warning (qty × unit price ≠ line total)
        </p>
      </div>
    </div>
  );
}

import { useTheme } from 'next-themes';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { resetDemoData } from '@/lib/seed-data';
import { clearAppStorage } from '@/lib/storage';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export function Settings() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, isRTL, setIsRTL } = useApp();
  const { toast } = useToast();

  const handleResetData = async () => {
    try {
      await resetDemoData();
      toast({
        title: 'Data reset',
        description: 'Demo data has been restored.',
      });
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset data.',
        variant: 'destructive',
      });
    }
  };

  const handleClearStorage = () => {
    clearAppStorage();
    toast({
      title: 'Storage cleared',
      description: 'Local settings have been cleared.',
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Localization</CardTitle>
          <CardDescription>Configure language and regional settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={locale} onValueChange={setLocale}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr-MA">Français (Maroc)</SelectItem>
                <SelectItem value="ar-MA">العربية (المغرب)</SelectItem>
                <SelectItem value="en-US">English (US)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Right-to-Left (RTL) Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable RTL layout for Arabic text
              </p>
            </div>
            <Switch checked={isRTL} onCheckedChange={setIsRTL} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Manage your application data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Reset Demo Data</Label>
              <p className="text-sm text-muted-foreground">
                Clear all data and restore original demo receipts
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Reset Data</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete all your receipts, vendors, and products, and restore the original demo data.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetData}>
                    Reset Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Clear Local Storage</Label>
              <p className="text-sm text-muted-foreground">
                Clear cached settings and preferences
              </p>
            </div>
            <Button variant="outline" onClick={handleClearStorage}>
              Clear Storage
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>Application information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Version:</strong> 1.0.0
            </p>
            <p>
              <strong>Currency:</strong> MAD (Moroccan Dirham)
            </p>
            <p className="text-muted-foreground">
              Receipt management system with OCR parsing, structured data extraction,
              and multi-language support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

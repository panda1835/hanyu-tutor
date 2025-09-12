import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { vocabularyService } from "../lib/vocabularyService";

interface CSVImporterProps {
  onImportComplete: (wordCount: number) => void;
  onCancel: () => void;
}

export default function CSVImporter({ onImportComplete, onCancel }: CSVImporterProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const text = await file.text();
      await vocabularyService.loadVocabularyFromCSV(text);
      const wordCount = vocabularyService.getFilteredVocabulary({ 
        selectedLevels: [], 
        selectedCategories: [], 
        showOnlyDue: false 
      }).length;
      
      setSuccess(`Successfully imported ${wordCount} words!`);
      setTimeout(() => {
        onImportComplete(wordCount);
      }, 2000);
    } catch (err) {
      console.error('Error importing CSV:', err);
      setError('Error importing CSV file. Please check the format.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Import Vocabulary</h2>
          <p className="text-muted-foreground text-sm">
            Upload a CSV file with Chinese vocabulary data
          </p>
        </div>

        <div className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label>CSV File</Label>
            <div className="space-y-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                data-testid="input-csv-file"
              />
              <Button
                variant="outline"
                onClick={handleUploadClick}
                disabled={isUploading}
                className="w-full"
                data-testid="button-upload-csv"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Choose CSV File
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Expected Format */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Expected CSV format:</p>
            <code className="block bg-muted p-2 rounded text-xs">
              character,level,category,pinyin,definition<br />
              愛,第1級,核心詞,ài,"to love, to be fond of..."<br />
              茶,第1級,10.餐飲、烹飪,chá,"tea, tea plant..."
            </code>
          </div>

          {/* Status Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          {success && (
            <Button onClick={() => onImportComplete(0)} className="flex-1">
              Continue
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
import { Save, Send, ArrowLeft, Printer, Download, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Quote, QuoteStatus } from "@/lib/types/quote";
import { formatCurrency } from "@/lib/utils";

interface QuoteEditorHeaderProps {
  quote: Quote;
  onSave: () => void;
  onSend?: () => void;
  onBack: () => void;
  onPrint?: () => void;
  onExport?: () => void;
  onDuplicate?: () => void;
  isDirty: boolean;
  isSaving: boolean;
}

export function QuoteEditorHeader({
  quote,
  onSave,
  onSend,
  onBack,
  onPrint,
  onExport,
  onDuplicate,
  isDirty,
  isSaving,
}: QuoteEditorHeaderProps) {
  const isEditable = quote.status === "draft";
  
  return (
    <div className="benaya-card benaya-gradient text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-white/10 hover:bg-white/20"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">
                {quote.number}
              </h1>
              {quote.status === "draft" && (
                <span className="bg-white/20 text-white text-xs px-2 py-1 rounded">
                  Brouillon
                </span>
              )}
            </div>
            <p className="text-benaya-100 mt-1">
              Client: {quote.clientName} {quote.projectName && `- Projet: ${quote.projectName}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-right mr-4">
            <div className="text-benaya-100 text-sm">Total TTC</div>
            <div className="text-xl font-bold">{formatCurrency(quote.totalTTC)} MAD</div>
          </div>
          
          {isEditable && (
            <Button 
              variant="outline" 
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
              onClick={onSave}
              disabled={!isDirty || isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          )}
          
          {isEditable && onSend && (
            <Button className="bg-white text-benaya-900 hover:bg-white/90">
              <Send className="w-4 h-4 mr-2" />
              Envoyer
            </Button>
          )}
          
          <div className="flex">
            {onPrint && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-white/10 hover:bg-white/20"
                onClick={onPrint}
              >
                <Printer className="w-4 h-4" />
              </Button>
            )}
            
            {onExport && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-white/10 hover:bg-white/20"
                onClick={onExport}
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
            
            {onDuplicate && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-white/10 hover:bg-white/20"
                onClick={onDuplicate}
              >
                <Copy className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { EditorQuoteItem, QuoteDetail, BulkQuoteData, quotesApi } from '@/lib/api/quotes';

interface QuoteTableState {
  quote: QuoteDetail | null;
  items: EditorQuoteItem[];
  selectedItems: Set<string>;
  editingItem: EditorQuoteItem | null;
  showTaxIncluded: boolean;
  showVatColumn: boolean;
  showDiscountColumn: boolean;
  calculations: {
    totalHT: number;
    totalTVA: number;
    totalTTC: number;
    vatBreakdown: Array<{ rate: number; base: number; amount: number }>;
  };
  isDirty: boolean;
}

type QuoteTableAction =
  | { type: 'SET_QUOTE'; payload: QuoteDetail }
  | { type: 'SET_ITEMS'; payload: EditorQuoteItem[] }
  | { type: 'ADD_ITEM'; payload: EditorQuoteItem }
  | { type: 'UPDATE_ITEM'; payload: { id: string; updates: Partial<EditorQuoteItem> } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'REORDER_ITEMS'; payload: { oldIndex: number; newIndex: number } }
  | { type: 'SELECT_ITEM'; payload: string }
  | { type: 'DESELECT_ITEM'; payload: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_EDITING_ITEM'; payload: EditorQuoteItem | null }
  | { type: 'TOGGLE_TAX_DISPLAY' }
  | { type: 'UPDATE_QUOTE_INFO'; payload: Partial<QuoteDetail> }
  | { type: 'SET_DIRTY'; payload: boolean };

// Fonction pour calculer le total d'un élément avec la nouvelle API
const calculateItemTotals = (item: EditorQuoteItem): { totalHt: number; totalTtc: number } => {
  if (item.type === 'chapter' || item.type === 'section') {
    return { totalHt: 0, totalTtc: 0 };
  }

  const totalHt = quotesApi.calculateItemTotal(item);
  const totalTtc = quotesApi.calculateItemTotalTTC(item);

  return { totalHt, totalTtc };
};

// Fonction pour calculer les totaux globaux avec la nouvelle API
const calculateGlobalTotals = (items: EditorQuoteItem[]) => {
  return quotesApi.calculateTotals(items);
};

// Fonction pour déterminer si les colonnes doivent être affichées
const shouldShowColumns = (items: EditorQuoteItem[]) => {
  const hasVat = items.some(item => 
    item.type !== 'chapter' && item.type !== 'section' && 
    parseFloat(item.tvaRate) > 0
  );
  
  const hasDiscount = items.some(item => 
    item.type !== 'chapter' && item.type !== 'section' && 
    item.discountPercentage > 0
  );

  return { showVatColumn: hasVat, showDiscountColumn: hasDiscount };
};

const quoteTableReducer = (state: QuoteTableState, action: QuoteTableAction): QuoteTableState => {
  switch (action.type) {
    case 'SET_QUOTE': {
      const quote = action.payload;
      const items = quote.items?.map(item => quotesApi.backendToEditorItem(item)) || [];
      const calculations = calculateGlobalTotals(items);
      const { showVatColumn, showDiscountColumn } = shouldShowColumns(items);
      
      return {
        ...state,
        quote,
        items,
        calculations,
        showVatColumn,
        showDiscountColumn,
        isDirty: false
      };
    }

    case 'SET_ITEMS': {
      const items = action.payload;
      const calculations = calculateGlobalTotals(items);
      const { showVatColumn, showDiscountColumn } = shouldShowColumns(items);
      
      return {
        ...state,
        items,
        calculations,
        showVatColumn,
        showDiscountColumn,
        isDirty: true
      };
    }

    case 'ADD_ITEM': {
      const newItem = {
        ...action.payload,
        id: action.payload.id || `temp-${Date.now()}`,
        ...calculateItemTotals(action.payload)
      };
      const items = [...state.items, newItem];
      const calculations = calculateGlobalTotals(items);
      const { showVatColumn, showDiscountColumn } = shouldShowColumns(items);
      
      return {
        ...state,
        items,
        calculations,
        showVatColumn,
        showDiscountColumn,
        isDirty: true
      };
    }

    case 'UPDATE_ITEM': {
      const { id, updates } = action.payload;
      const items = state.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, ...updates };
          return {
            ...updatedItem,
            ...calculateItemTotals(updatedItem)
          };
        }
        return item;
      });
      const calculations = calculateGlobalTotals(items);
      const { showVatColumn, showDiscountColumn } = shouldShowColumns(items);
      
      return {
        ...state,
        items,
        calculations,
        showVatColumn,
        showDiscountColumn,
        isDirty: true
      };
    }

    case 'REMOVE_ITEM': {
      const items = state.items.filter(item => item.id !== action.payload);
      const selectedItems = new Set(state.selectedItems);
      selectedItems.delete(action.payload);
      const calculations = calculateGlobalTotals(items);
      const { showVatColumn, showDiscountColumn } = shouldShowColumns(items);
      
      return {
        ...state,
        items,
        selectedItems,
        calculations,
        showVatColumn,
        showDiscountColumn,
        isDirty: true
      };
    }

    case 'REORDER_ITEMS': {
      const { oldIndex, newIndex } = action.payload;
      const items = [...state.items];
      const [removed] = items.splice(oldIndex, 1);
      items.splice(newIndex, 0, removed);
      
      // Recalculer les positions
      const updatedItems = items.map((item, index) => ({
        ...item,
        position: index + 1
      }));

      return {
        ...state,
        items: updatedItems,
        isDirty: true
      };
    }

    case 'SELECT_ITEM': {
      const selectedItems = new Set(state.selectedItems);
      selectedItems.add(action.payload);
      return { ...state, selectedItems };
    }

    case 'DESELECT_ITEM': {
      const selectedItems = new Set(state.selectedItems);
      selectedItems.delete(action.payload);
      return { ...state, selectedItems };
    }

    case 'CLEAR_SELECTION': {
      return { ...state, selectedItems: new Set() };
    }

    case 'SET_EDITING_ITEM': {
      return { ...state, editingItem: action.payload };
    }

    case 'TOGGLE_TAX_DISPLAY': {
      return { ...state, showTaxIncluded: !state.showTaxIncluded };
    }

    case 'UPDATE_QUOTE_INFO': {
      return {
        ...state,
        quote: state.quote ? { ...state.quote, ...action.payload } : null,
        isDirty: true
      };
    }

    case 'SET_DIRTY': {
      return { ...state, isDirty: action.payload };
    }

    default:
      return state;
  }
};

interface QuoteTableContextValue {
  state: QuoteTableState;
  actions: {
    setQuote: (quote: QuoteDetail) => void;
    setItems: (items: EditorQuoteItem[]) => void;
    addItem: (item: EditorQuoteItem) => void;
    updateItem: (id: string, updates: Partial<EditorQuoteItem>) => void;
    removeItem: (id: string) => void;
    reorderItems: (oldIndex: number, newIndex: number) => void;
    selectItem: (id: string) => void;
    deselectItem: (id: string) => void;
    clearSelection: () => void;
    setEditingItem: (item: EditorQuoteItem | null) => void;
    toggleTaxDisplay: () => void;
    updateQuoteInfo: (updates: Partial<QuoteDetail>) => void;
    save: () => Promise<void>;
  };
  helpers: {
    getRootItems: () => EditorQuoteItem[];
    getChildItems: (parentId: string) => EditorQuoteItem[];
    hasChildren: (itemId: string) => boolean;
    canHaveChildren: (itemType: string) => boolean;
    getSectionTotal: (sectionId: string) => { totalHT: number; totalTTC: number };
    isDirty: () => boolean;
  };
}

const QuoteTableContext = createContext<QuoteTableContextValue | null>(null);

export const useQuoteTable = () => {
  const context = useContext(QuoteTableContext);
  if (!context) {
    throw new Error('useQuoteTable must be used within QuoteTableProvider');
  }
  return context;
};

interface QuoteTableProviderProps {
  children: React.ReactNode;
  initialQuote?: QuoteDetail | null;
  onSave?: (data: BulkQuoteData) => Promise<void>;
  saving?: boolean;
}

export const QuoteTableProvider: React.FC<QuoteTableProviderProps> = ({
  children,
  initialQuote = null,
  onSave,
  saving = false
}) => {
  const [state, dispatch] = useReducer(quoteTableReducer, {
    quote: initialQuote,
    items: initialQuote?.items?.map(item => quotesApi.backendToEditorItem(item)) || [],
    selectedItems: new Set(),
    editingItem: null,
    showTaxIncluded: true,
    showVatColumn: false,
    showDiscountColumn: false,
    calculations: calculateGlobalTotals(
      initialQuote?.items?.map(item => quotesApi.backendToEditorItem(item)) || []
    ),
    isDirty: false
  });

  // Actions
  const actions = useMemo(() => ({
    setQuote: useCallback((quote: QuoteDetail) => {
      dispatch({ type: 'SET_QUOTE', payload: quote });
    }, []),

    setItems: useCallback((items: EditorQuoteItem[]) => {
      dispatch({ type: 'SET_ITEMS', payload: items });
    }, []),

    addItem: useCallback((item: EditorQuoteItem) => {
      dispatch({ type: 'ADD_ITEM', payload: item });
    }, []),

    updateItem: useCallback((id: string, updates: Partial<EditorQuoteItem>) => {
      dispatch({ type: 'UPDATE_ITEM', payload: { id, updates } });
    }, []),

    removeItem: useCallback((id: string) => {
      dispatch({ type: 'REMOVE_ITEM', payload: id });
    }, []),

    reorderItems: useCallback((oldIndex: number, newIndex: number) => {
      dispatch({ type: 'REORDER_ITEMS', payload: { oldIndex, newIndex } });
    }, []),

    selectItem: useCallback((id: string) => {
      dispatch({ type: 'SELECT_ITEM', payload: id });
    }, []),

    deselectItem: useCallback((id: string) => {
      dispatch({ type: 'DESELECT_ITEM', payload: id });
    }, []),

    clearSelection: useCallback(() => {
      dispatch({ type: 'CLEAR_SELECTION' });
    }, []),

    setEditingItem: useCallback((item: EditorQuoteItem | null) => {
      dispatch({ type: 'SET_EDITING_ITEM', payload: item });
    }, []),

    toggleTaxDisplay: useCallback(() => {
      dispatch({ type: 'TOGGLE_TAX_DISPLAY' });
    }, []),

    updateQuoteInfo: useCallback((updates: Partial<QuoteDetail>) => {
      dispatch({ type: 'UPDATE_QUOTE_INFO', payload: updates });
    }, []),

    save: useCallback(async () => {
      if (!onSave || !state.quote) return;

      const bulkData: BulkQuoteData = {
        quote: {
          tier: state.quote.tier,
          client_name: state.quote.client_name,
          client_address: state.quote.client_address,
          project_name: state.quote.project_name,
          issue_date: state.quote.issue_date,
          expiry_date: state.quote.expiry_date,
          conditions: state.quote.conditions,
          notes: state.quote.notes,
          status: state.quote.status,
          number: state.quote.number,
        },
        items: state.items
      };

      await onSave(bulkData);
      dispatch({ type: 'SET_DIRTY', payload: false });
    }, [onSave, state.quote, state.items])
  }), [onSave, state.quote, state.items]);

  // Helpers
  const helpers = useMemo(() => ({
    getRootItems: useCallback(() => {
      return state.items.filter(item => !item.parent).sort((a, b) => (a.position || 0) - (b.position || 0));
    }, [state.items]),

    getChildItems: useCallback((parentId: string) => {
      return state.items.filter(item => item.parent === parentId).sort((a, b) => (a.position || 0) - (b.position || 0));
    }, [state.items]),

    hasChildren: useCallback((itemId: string) => {
      return state.items.some(item => item.parent === itemId);
    }, [state.items]),

    canHaveChildren: useCallback((itemType: string) => {
      return itemType === 'chapter' || itemType === 'section';
    }, []),

    getSectionTotal: useCallback((sectionId: string) => {
      const sectionItems = state.items.filter(item => item.parent === sectionId);
      const totals = calculateGlobalTotals(sectionItems);
      return { totalHT: totals.totalHT, totalTTC: totals.totalTTC };
    }, [state.items]),

    isDirty: useCallback(() => {
      return state.isDirty;
    }, [state.isDirty])
  }), [state.items, state.isDirty]);

  const contextValue = useMemo(() => ({
    state,
    actions,
    helpers
  }), [state, actions, helpers]);

  return (
    <QuoteTableContext.Provider value={contextValue}>
      {children}
    </QuoteTableContext.Provider>
  );
}; 
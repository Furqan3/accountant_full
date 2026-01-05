"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Company = {
  id: string;
  company_number: string;
  company_name: string;
  company_status?: string;
  company_type?: string;
  confirmation_statement_due?: string;
  accounts_due?: string;
  is_favorite?: boolean;
};

interface BulkSelectionContextType {
  selectedCompanies: Company[];
  addCompany: (company: Company) => void;
  removeCompany: (companyId: string) => void;
  clearSelection: () => void;
  isSelected: (companyId: string) => boolean;
}

const BulkSelectionContext = createContext<BulkSelectionContextType | undefined>(undefined);

const STORAGE_KEY = 'bulk-selected-companies';

export function BulkSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSelectedCompanies(parsed);
      } catch (error) {
        console.error('Failed to parse stored companies:', error);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save to sessionStorage whenever selection changes
  useEffect(() => {
    if (isHydrated) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selectedCompanies));
    }
  }, [selectedCompanies, isHydrated]);

  const addCompany = (company: Company) => {
    setSelectedCompanies(prev => {
      // Don't add if already selected
      if (prev.some(c => c.id === company.id)) {
        return prev;
      }
      return [...prev, company];
    });
  };

  const removeCompany = (companyId: string) => {
    setSelectedCompanies(prev => prev.filter(c => c.id !== companyId));
  };

  const clearSelection = () => {
    setSelectedCompanies([]);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const isSelected = (companyId: string) => {
    return selectedCompanies.some(c => c.id === companyId);
  };

  const value = {
    selectedCompanies,
    addCompany,
    removeCompany,
    clearSelection,
    isSelected,
  };

  return (
    <BulkSelectionContext.Provider value={value}>
      {children}
    </BulkSelectionContext.Provider>
  );
}

export function useBulkSelection() {
  const context = useContext(BulkSelectionContext);
  if (context === undefined) {
    throw new Error('useBulkSelection must be used within a BulkSelectionProvider');
  }
  return context;
}

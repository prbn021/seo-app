/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// THIS FILE HAS BEEN REPURPOSED AS THE CREATE PROJECT PAGE

import React, { useState, useCallback } from 'react';
import { findLeads } from '../services/geminiService';
import type { Lead, AppLogSeverity } from '../App';
import { SpinnerIcon, SearchIcon } from './icons';

interface CreateProjectPageProps {
  onSaveProject: (keyword: string, leads: Omit<Lead, 'id' | 'status'>[]) => void;
  onError: (message: string) => void;
  logEvent: (severity: AppLogSeverity, action: string, details: string) => void;
}

const CreateProjectPage: React.FC<CreateProjectPageProps> = ({ onSaveProject, onError, logEvent }) => {
  const [keyword, setKeyword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSearch = useCallback(async () => {
    if (!keyword.trim()) {
      onError('Please enter a keyword.');
      return;
    }
    setIsLoading(true);
    onError('');

    try {
      const results = await findLeads(keyword);
      onSaveProject(keyword, results);
      setKeyword('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      onError(errorMessage);
      logEvent('Error', 'Lead Generation Failed', `Attempt to find leads for keyword "${keyword}" failed. Reason: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [keyword, onSaveProject, onError, logEvent]);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 animate-fade-in">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Iniciar Prospecção
          </h1>
          <p className="mt-2 text-md text-slate-400">
            Insira uma palavra-chave para encontrar novos leads automaticamente. A palavra-chave será usada como o nome do projeto.
          </p>
        </div>
        
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSearch(); }} 
          className="w-full mt-8 flex flex-col items-center gap-4"
        >
          <div className="w-full flex items-center gap-3">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Ex: 'clínicas odontológicas em São Paulo'"
              className="flex-grow bg-slate-700 border border-slate-600 text-slate-200 rounded-lg p-3 text-md focus:ring-2 focus:ring-violet-500 focus:outline-none transition w-full"
              disabled={isLoading}
            />
            <button 
              type="submit"
              className="flex items-center justify-center bg-violet-600 text-white font-bold py-3 px-5 text-md rounded-lg transition-colors hover:bg-violet-500 active:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !keyword.trim()}
            >
              {isLoading ? (
                <>
                  <SpinnerIcon className="w-5 h-5 mr-2" />
                  Buscando...
                </>
              ) : (
                <>
                  <SearchIcon className="w-5 h-5 mr-2" />
                  Buscar Leads
                </>
              )}
            </button>
          </div>
        </form>

        {isLoading && (
          <div className="mt-6 flex flex-col items-center gap-4">
            <p className="text-slate-400">A IA está buscando e criando seu projeto...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateProjectPage;
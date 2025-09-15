/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import type { Page } from '../App';
import { SettingsIcon } from './icons';

interface HeaderProps {
    onNavigate: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  return (
    <header className="w-full h-16 flex-shrink-0 py-3 px-6 border-b border-slate-800 bg-slate-900 sticky top-0 z-40 flex items-center justify-between gap-4">
        <div className="flex-1">
            <h1 className="text-xl font-bold text-white">ProspectMaster</h1>
        </div>
        <div className="flex items-center gap-4">
            <button 
                onClick={() => onNavigate('configurações')}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Open Settings"
            >
                <SettingsIcon className="w-6 h-6" />
            </button>
            {/* User profile can go here */}
        </div>
    </header>
  );
};

export default Header;
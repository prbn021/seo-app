/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import type { Page } from '../App';
import { DashboardIcon, SearchIcon, EmailIcon, CrmIcon, AnalyticsIcon, ProfileIcon } from './icons';

interface ProjectsSidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const ProjectsSidebar: React.FC<ProjectsSidebarProps> = ({ activePage, setActivePage }) => {
  const navItems: { id: Page; name: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', name: 'Dashboard', icon: DashboardIcon },
    { id: 'prospecção', name: 'Prospecção', icon: SearchIcon },
    { id: 'marketing', name: 'Marketing', icon: EmailIcon },
    { id: 'crm', name: 'CRM', icon: CrmIcon },
    { id: 'analytics', name: 'Analytics', icon: AnalyticsIcon },
    { id: 'perfil', name: 'Perfil', icon: ProfileIcon },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center font-bold text-white text-lg">P</div>
          <div>
            <h1 className="text-md font-bold text-white">ProspectMaster</h1>
            <p className="text-xs text-slate-400">Sistema de Prospecção</p>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Navegação</p>
          {navItems.map(item => {
            const IconComponent = item.icon;
            const isActive = activePage === item.id || 
                             (activePage === 'projectDetails' && item.id === 'prospecção') || 
                             (activePage === 'createProject' && item.id === 'prospecção');
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex items-center w-full text-left p-2.5 rounded-md transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-slate-700/80 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <IconComponent className="w-5 h-5 flex-shrink-0" />
                <span className="ml-3 whitespace-nowrap">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-800 pt-4 mt-4">
         <div className="bg-slate-800 p-4 rounded-lg text-center">
            <h4 className="font-bold text-white">Upgrade Pro</h4>
            <p className="text-xs text-slate-400 mt-1 mb-3">Aumente seus limites e tenha mais funcionalidades</p>
            <button className="w-full bg-violet-600 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-violet-500 transition-colors">
                Upgrade
            </button>
         </div>
      </div>
    </aside>
  );
};

export default ProjectsSidebar;
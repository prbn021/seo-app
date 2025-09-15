/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useMemo } from 'react';
import type { Project, AppLog, Page } from '../App';
import { SearchIcon, EmailIcon, UserGroupIcon, BullseyeIcon, CheckCircleIcon, TrendingUpIcon } from './icons';

interface DashboardPageProps {
  projects: Project[];
  appLogs: AppLog[];
  onNavigate: (page: Page) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="text-3xl font-bold mt-1 text-white">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            {icon}
        </div>
    </div>
);

const QuickActionCard: React.FC<{ title: string; description: string; icon: React.ReactNode; onClick: () => void; color: string }> = ({ title, description, icon, onClick, color }) => (
    <button
        onClick={onClick}
        className={`bg-slate-800 p-5 rounded-xl border border-slate-700 flex items-start gap-4 text-left hover:border-${color}-500 hover:bg-slate-700/50 transition-all duration-200 w-full`}
    >
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-${color}-900/50 flex items-center justify-center`}>
            {React.cloneElement(icon as any, { className: `w-5 h-5 text-${color}-400` })}
        </div>
        <div>
            <h4 className="font-bold text-white">{title}</h4>
            <p className="text-sm text-slate-400 mt-1">{description}</p>
        </div>
    </button>
);


const DashboardPage: React.FC<DashboardPageProps> = ({ projects, appLogs, onNavigate }) => {
    const stats = useMemo(() => {
        const totalLeads = projects.reduce((acc, p) => acc + p.leads.length, 0);
        // Mock data for other stats as it's not tracked in the app state
        const activeCampaigns = 8;
        const conversions = 342;
        const successRate = totalLeads > 0 ? ((conversions / totalLeads) * 100).toFixed(1) + '%' : '27.4%';
        
        return { totalLeads, activeCampaigns, conversions, successRate };
    }, [projects]);

    const recentActivity = useMemo(() => {
        return appLogs.slice(0, 5); // Get the 5 most recent logs
    }, [appLogs]);

    const activityColors: Record<string, string> = {
        'Success': 'bg-green-500',
        'Info': 'bg-violet-500',
        'Error': 'bg-red-500',
    }

    return (
        <div className="w-full flex flex-col gap-8 animate-fade-in">
            <div>
                <h1 className="text-4xl font-bold text-white">Dashboard</h1>
                <p className="mt-1 text-slate-400">Bem-vindo ao seu painel de controle de prospecção</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard title="Leads Captados" value={stats.totalLeads} icon={<BullseyeIcon className="w-6 h-6 text-green-400" />}/>
                <StatCard title="Campanhas Ativas" value={stats.activeCampaigns} icon={<EmailIcon className="w-6 h-6 text-violet-400" />}/>
                <StatCard title="Conversões" value={stats.conversions} icon={<CheckCircleIcon className="w-6 h-6 text-green-400" />}/>
                <StatCard title="Taxa de Sucesso" value={stats.successRate} icon={<TrendingUpIcon className="w-6 h-6 text-yellow-400" />}/>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-white">Ações Rápidas</h3>
                    <div className="flex flex-col gap-3">
                       <QuickActionCard title="Iniciar Prospecção" description="Buscar novos leads por palavra-chave" icon={<SearchIcon />} onClick={() => onNavigate('createProject')} color="violet" />
                       <QuickActionCard title="Campanha de Email" description="Enviar emails para leads selecionados" icon={<EmailIcon />} onClick={() => onNavigate('marketing')} color="green" />
                       <QuickActionCard title="Gerenciar CRM" description="Atualizar status dos leads" icon={<UserGroupIcon />} onClick={() => onNavigate('crm')} color="yellow" />
                    </div>
                </div>
                 <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col gap-4">
                     <h3 className="text-lg font-bold text-white">Atividade Recente</h3>
                     <ul className="space-y-4">
                        {recentActivity.map(log => (
                            <li key={log.id} className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${activityColors[log.severity] || 'bg-slate-500'}`}></div>
                                <div>
                                    <p className="text-sm font-medium text-white">{log.action}</p>
                                    <p className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleString()}</p>
                                </div>
                            </li>
                        ))}
                     </ul>
                </div>
            </div>

        </div>
    );
};

export default DashboardPage;
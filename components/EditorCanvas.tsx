/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// THIS FILE HAS BEEN REPURPOSED AS THE PROJECT DETAILS PAGE

import React, { useState, useMemo } from 'react';
import type { Project, Lead, AppLog, AppLogSeverity } from '../App';

const LogSeverityBadge: React.FC<{ severity: AppLogSeverity }> = ({ severity }) => {
    const colorClasses = {
        'Info': 'bg-blue-800 text-blue-200',
        'Success': 'bg-green-800 text-green-200',
        'Error': 'bg-red-800 text-red-200',
    }[severity];
    return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colorClasses}`}>{severity}</span>;
};

const LeadLogsPanel: React.FC<{ lead: Lead; logs: AppLog[]; onClose: () => void }> = ({ lead, logs, onClose }) => {
    const filteredLogs = useMemo(() => {
        return logs.filter(log => 
            log.details.includes(lead.companyName) || 
            log.action.includes(lead.companyName)
        );
    }, [logs, lead.companyName]);

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-fade-in-left">
                <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white truncate">Logs for {lead.companyName}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto">
                    {filteredLogs.length > 0 ? (
                        <ul className="space-y-4">
                            {filteredLogs.map(log => (
                                <li key={log.id} className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                                    <div className="flex justify-between items-center mb-1">
                                        <LogSeverityBadge severity={log.severity} />
                                        <span className="text-xs text-slate-500 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-white mt-2">{log.action}</p>
                                    <p className="text-xs text-slate-400 mt-1">{log.details}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-slate-400 mt-8">No logs found for this lead.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// EditLeadModal component defined at the top level to prevent invalid hook calls.
const EditLeadModal: React.FC<{
    lead: Lead;
    onClose: () => void;
    onSave: (updatedData: Partial<Omit<Lead, 'id' | 'status'>>) => void;
}> = ({ lead, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        companyName: lead.companyName,
        url: lead.url,
        email: lead.email,
        phone: lead.phone,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-lg flex flex-col gap-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Edit Lead</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-3xl leading-none" aria-label="Close modal">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="companyName" className="text-sm font-medium text-slate-400">Company Name</label>
                        <input id="companyName" type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="mt-1 w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-violet-500 focus:outline-none" />
                    </div>
                     <div>
                        <label htmlFor="url" className="text-sm font-medium text-slate-400">Website URL</label>
                        <input id="url" type="text" name="url" value={formData.url} onChange={handleChange} className="mt-1 w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-violet-500 focus:outline-none" />
                    </div>
                     <div>
                        <label htmlFor="email" className="text-sm font-medium text-slate-400">Email</label>
                        <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-violet-500 focus:outline-none" />
                    </div>
                    <div>
                        <label htmlFor="phone" className="text-sm font-medium text-slate-400">Phone</label>
                        <input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-violet-500 focus:outline-none" />
                    </div>
                    <div className="flex justify-end gap-3 mt-2">
                        <button type="button" onClick={onClose} className="bg-slate-700 text-slate-200 font-semibold py-2 px-5 rounded-lg hover:bg-slate-600 transition-colors">Cancel</button>
                        <button type="submit" className="bg-violet-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-violet-500 transition-colors">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


interface ProjectDetailsPageProps {
  project: Project;
  onUpdateLead: (leadId: string, projectId: string, updatedLeadData: Partial<Omit<Lead, 'id' | 'status'>>) => void;
  appLogs: AppLog[];
}

const ProjectDetailsPage: React.FC<ProjectDetailsPageProps> = ({ project, onUpdateLead, appLogs }) => {
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [selectedLeadForLogs, setSelectedLeadForLogs] = useState<Lead | null>(null);

    const handleSaveLead = (updatedData: Partial<Omit<Lead, 'id' | 'status'>>) => {
        if (editingLead) {
            onUpdateLead(editingLead.id, project.id, updatedData);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 animate-fade-in relative">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-100">{project.name}</h1>
                <p className="mt-1 text-md text-slate-400">Keyword: "{project.keyword}"</p>
            </div>
            
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-slate-900">
                            <tr className="border-b border-slate-700">
                                <th className="p-3 text-sm font-semibold text-slate-400">Company</th>
                                <th className="p-3 text-sm font-semibold text-slate-400">Email</th>
                                <th className="p-3 text-sm font-semibold text-slate-400">Phone</th>
                                <th className="p-3 text-sm font-semibold text-slate-400">CRM Status</th>
                                <th className="p-3 text-sm font-semibold text-slate-400">Email Status</th>
                                <th className="p-3 text-sm font-semibold text-slate-400">WhatsApp Status</th>
                                <th className="p-3 text-sm font-semibold text-slate-400"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {project.leads.map(lead => (
                                <tr 
                                  key={lead.id} 
                                  onClick={() => setSelectedLeadForLogs(lead)}
                                  className={`border-b border-slate-800 hover:bg-slate-700/50 cursor-pointer transition-colors ${selectedLeadForLogs?.id === lead.id ? 'bg-slate-700' : ''}`}
                                >
                                    <td className="p-3 font-medium text-slate-200">{lead.companyName}</td>
                                    <td className="p-3 text-slate-300">{lead.email}</td>
                                    <td className="p-3 text-slate-300">{lead.phone}</td>
                                    <td className="p-3"><span className="text-xs font-medium text-violet-300 px-2 py-1 bg-violet-900/50 rounded-md">{lead.status}</span></td>
                                    <td className="p-3 text-slate-300 text-sm">{lead.engagement.emailStatus}</td>
                                    <td className="p-3 text-slate-300 text-sm">{lead.engagement.whatsappStatus}</td>
                                    <td className="p-3 text-right">
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); setEditingLead(lead); }} 
                                          className="text-violet-400 hover:text-violet-300 font-semibold text-sm"
                                        >
                                          Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {project.leads.length === 0 && (
                     <p className="text-center text-slate-400 py-8">This project has no leads yet.</p>
                )}
            </div>

            {editingLead && (
                <EditLeadModal 
                    lead={editingLead}
                    onClose={() => setEditingLead(null)}
                    onSave={handleSaveLead}
                />
            )}

            {selectedLeadForLogs && (
                <LeadLogsPanel 
                    lead={selectedLeadForLogs}
                    logs={appLogs}
                    onClose={() => setSelectedLeadForLogs(null)}
                />
            )}
        </div>
    );
};

export default ProjectDetailsPage;
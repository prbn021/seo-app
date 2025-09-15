/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// THIS FILE HAS BEEN REPURPOSED AS THE CRM PAGE
// This component displays the lead pipeline in a Kanban board format.

import React, { useState, useMemo } from 'react';
import { type Lead, type CrmStatus, CRM_STATUSES, type Project } from '../App';
import { PhoneIcon, EmailIcon } from './icons';

interface LeadCardProps {
  lead: Lead;
  onMove: (direction: 'prev' | 'next') => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onMove }) => {
  const currentStatusIndex = CRM_STATUSES.indexOf(lead.status);
  const canMovePrev = currentStatusIndex > 0;
  const canMoveNext = currentStatusIndex < CRM_STATUSES.length - 1;

  return (
    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 w-full flex flex-col gap-2">
      <h4 className="font-bold text-white">{lead.companyName}</h4>
      <p className="text-xs text-slate-400 flex items-center gap-1.5"><EmailIcon className="w-3 h-3" />{lead.email}</p>
      <p className="text-xs text-slate-400 flex items-center gap-1.5"><PhoneIcon className="w-3 h-3" />{lead.phone}</p>
      <div className="mt-2 flex justify-between items-center">
        <button 
          onClick={() => onMove('prev')} 
          disabled={!canMovePrev}
          className="text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Move to previous status"
        >
          &larr;
        </button>
        <button 
          onClick={() => onMove('next')} 
          disabled={!canMoveNext}
          className="text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Move to next status"
        >
          &rarr;
        </button>
      </div>
    </div>
  );
};

interface CrmPageProps {
  projects: Project[];
  onUpdateLeadStatus: (leadId: string, projectId: string, newStatus: CrmStatus) => void;
}

const CrmPage: React.FC<CrmPageProps> = ({ projects, onUpdateLeadStatus }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

  const leadsWithProjectId = useMemo(() => {
    if (selectedProjectId === 'all') {
      return projects.flatMap(p => p.leads.map(l => ({ ...l, projectId: p.id })));
    }
    const project = projects.find(p => p.id === selectedProjectId);
    return project ? project.leads.map(l => ({ ...l, projectId: project.id })) : [];
  }, [projects, selectedProjectId]);
  
  const handleMoveLead = (leadId: string, projectId: string, currentStatus: CrmStatus, direction: 'prev' | 'next') => {
    const currentIndex = CRM_STATUSES.indexOf(currentStatus);
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < CRM_STATUSES.length) {
      onUpdateLeadStatus(leadId, projectId, CRM_STATUSES[newIndex]);
    }
  };

  const leadsByStatus = CRM_STATUSES.reduce((acc, status) => {
    acc[status] = leadsWithProjectId.filter(lead => lead.status === status);
    return acc;
  }, {} as Record<CrmStatus, (Lead & { projectId: string })[]>);

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-4xl font-bold text-white">CRM</h1>
             {projects.length > 0 && (
              <select 
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none transition"
                aria-label="Filter by project"
              >
                <option value="all">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            )}
        </div>
        {projects.length === 0 ? (
           <p className="text-center text-slate-400 mt-8 text-lg">You haven't created any projects yet. Go create one to find leads!</p>
        ) : leadsWithProjectId.length === 0 ? (
            <p className="text-center text-slate-400 mt-8 text-lg">No leads found for the selected project.</p>
        ) : (
            <div className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
            {CRM_STATUSES.map(status => (
                <div key={status} className="bg-slate-800 border border-slate-700 rounded-xl p-3 flex flex-col gap-3 h-full">
                <h3 className="font-semibold text-center text-white sticky top-16 bg-slate-800 py-2 border-b border-slate-700">{status} ({leadsByStatus[status].length})</h3>
                <div className="flex flex-col gap-3 overflow-y-auto">
                    {leadsByStatus[status].map(lead => (
                    <LeadCard 
                        key={lead.id} 
                        lead={lead} 
                        onMove={(direction) => handleMoveLead(lead.id, lead.projectId, lead.status, direction)}
                    />
                    ))}
                </div>
                </div>
            ))}
            </div>
        )}
    </div>
  );
};

export default CrmPage;
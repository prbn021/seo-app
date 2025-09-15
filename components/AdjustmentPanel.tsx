/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// THIS FILE HAS BEEN REPURPOSED AS THE OUTREACH PAGE
import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Lead, Project, EmailStatus, WhatsAppStatus, Campaign, CampaignStep, EmailLog, EmailLogStatus } from '../App';
import { EyeIcon, ReplyIcon, PlusIcon, PlayIcon, RetryIcon, WarningIcon } from './icons';

type ActiveTab = 'campaign' | 'tracking' | 'automation' | 'logs';
const EMAIL_STATUS_OPTIONS: EmailStatus[] = ['Not Sent', 'Sent', 'Opened', 'Replied'];
const WHATSAPP_STATUS_OPTIONS: WhatsAppStatus[] = ['Not Sent', 'Sent'];

const EngagementStatusBadge: React.FC<{ status: EmailStatus | WhatsAppStatus }> = ({ status }) => {
    const colorClasses = {
        'Not Sent': 'bg-slate-600 text-slate-300',
        'Sent': 'bg-blue-800 text-blue-200',
        'Opened': 'bg-yellow-800 text-yellow-200',
        'Replied': 'bg-green-800 text-green-200',
    }[status] || 'bg-gray-700 text-gray-300';

    return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colorClasses}`}>{status}</span>;
};

const EmailLogStatusBadge: React.FC<{ status: EmailLogStatus }> = ({ status }) => {
    const colorClasses = {
        'Queued': 'bg-yellow-800 text-yellow-200 animate-pulse',
        'Sent': 'bg-green-800 text-green-200',
        'Error': 'bg-red-800 text-red-200',
    }[status];
    return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colorClasses}`}>{status}</span>;
};


// A self-contained editor component to fix the invalid hook call issue.
// By defining it at the top level, it maintains its state correctly.
const CampaignEditor: React.FC<{
    campaignForm: Campaign;
    setCampaignForm: React.Dispatch<React.SetStateAction<Campaign | null>>;
    projects: Project[];
    allLeads: (Lead & { projectId: string; projectName: string; })[];
    onSave: () => void;
    onActivate: (campaignId: string) => void;
    onClose: () => void;
}> = ({ campaignForm, setCampaignForm, projects, allLeads, onSave, onActivate, onClose }) => {
    const [editorTab, setEditorTab] = useState<'setup' | 'performance'>(
        campaignForm.status === 'Active' ? 'performance' : 'setup'
    );
    const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false);
    const projectSelectorRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        setEditorTab(campaignForm.status === 'Active' ? 'performance' : 'setup');
    }, [campaignForm.id, campaignForm.status]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (projectSelectorRef.current && !projectSelectorRef.current.contains(event.target as Node)) {
                setIsProjectSelectorOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [projectSelectorRef]);

    const enrolledLeads = allLeads.filter(lead => lead.campaignStatus?.campaignId === campaignForm.id);

    const handleFormChange = (field: keyof Campaign, value: any) => setCampaignForm(prev => prev ? { ...prev, [field]: value } : null);
    
    const handleStepChange = (stepId: string, field: keyof CampaignStep, value: string | number) => {
      setCampaignForm(prev => {
        if (!prev) return null;
        const newSteps = prev.steps.map(s => s.id === stepId ? { ...s, [field]: value } : s);
        return { ...prev, steps: newSteps };
      });
    };

    const handleAddStep = () => {
        const newStep: CampaignStep = { id: `step-${Date.now()}`, delayDays: 1, sendTime: '09:00', subject: `Follow Up ${campaignForm.steps.length + 1}`, body: '' };
        handleFormChange('steps', [...campaignForm.steps, newStep]);
    };

    const handleRemoveStep = (stepId: string) => handleFormChange('steps', campaignForm.steps.filter(s => s.id !== stepId));

    const handleProjectSelection = (projectId: string) => {
        const currentIds = campaignForm.projectIds;
        const newIds = currentIds.includes(projectId) ? currentIds.filter(id => id !== projectId) : [...currentIds, projectId];
        handleFormChange('projectIds', newIds);
    }
    
    const renderSetupTab = () => (
        <div className="flex flex-col gap-6">
            {/* Campaign Settings */}
            <div className="grid md:grid-cols-2 gap-6">
                <input type="text" value={campaignForm.name} onChange={e => handleFormChange('name', e.target.value)} placeholder="Campaign Name" className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-3 text-lg font-semibold focus:ring-2 focus:ring-violet-500 focus:outline-none"/>
                <select value={campaignForm.channel} onChange={e => handleFormChange('channel', e.target.value as 'email' | 'whatsapp')} className="bg-slate-700 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-violet-500 focus:outline-none">
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                </select>
            </div>

            {/* Steps Editor */}
            <div className="space-y-4">
                <h3 className="font-bold text-lg text-white">Sequence Steps</h3>
                {campaignForm.steps.map((step, index) => (
                    <div key={step.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                           <h4 className="font-semibold text-md text-white">Step {index + 1}</h4>
                           <button onClick={() => handleRemoveStep(step.id)} className="text-red-400 hover:text-red-300 text-xs font-bold">Remove</button>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-slate-300">Send after</span>
                          <input type="number" value={step.delayDays} onChange={e => handleStepChange(step.id, 'delayDays', parseInt(e.target.value) || 0)} min="0" className="w-20 bg-slate-700 border border-slate-600 rounded p-1 text-center"/>
                          <span className="text-slate-300">days, at</span>
                          <input type="time" value={step.sendTime} onChange={e => handleStepChange(step.id, 'sendTime', e.target.value)} className="bg-slate-700 border border-slate-600 rounded p-1"/>
                        </div>
                        {campaignForm.channel === 'email' && <input type="text" value={step.subject} onChange={e => handleStepChange(step.id, 'subject', e.target.value)} placeholder="Email Subject" className="w-full bg-slate-700 border border-slate-600 rounded p-2"/>}
                        <textarea value={step.body} onChange={e => handleStepChange(step.id, 'body', e.target.value)} placeholder="Message Body... Use {companyName}" rows={4} className="w-full bg-slate-700 border border-slate-600 rounded p-2"/>
                    </div>
                ))}
                <button onClick={handleAddStep} className="text-sm flex items-center bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-3 rounded-lg"><PlusIcon className="w-4 h-4 mr-1"/>Add Step</button>
            </div>

            {/* Project Association */}
            <div>
                <h3 className="font-bold text-lg mb-2 text-white">Associate Projects</h3>
                 <div className="relative" ref={projectSelectorRef}>
                    <button
                        onClick={() => setIsProjectSelectorOpen(prev => !prev)}
                        className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-3 text-left flex justify-between items-center"
                    >
                        <span>
                            {campaignForm.projectIds.length > 0 
                                ? `${campaignForm.projectIds.length} project(s) selected` 
                                : "Select projects..."}
                        </span>
                        <span>&#9662;</span>
                    </button>
                    {isProjectSelectorOpen && (
                        <div className="absolute top-full mt-2 w-full bg-slate-800 border border-slate-700 rounded-lg z-10 max-h-60 overflow-y-auto">
                            {projects.map(p => (
                                <label key={p.id} className="flex items-center gap-3 p-3 hover:bg-slate-700 cursor-pointer border-b border-slate-700/50 last:border-b-0">
                                    <input
                                        type="checkbox"
                                        checked={campaignForm.projectIds.includes(p.id)}
                                        onChange={() => handleProjectSelection(p.id)}
                                        className="w-4 h-4 rounded text-violet-500 bg-slate-600 border-slate-500 focus:ring-violet-600"
                                    />
                                    <span>{p.name}</span>
                                </label>
                            ))}
                             {projects.length === 0 && <p className="text-slate-400 text-sm p-3">No projects available.</p>}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                <button onClick={onSave} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-5 rounded-lg">Save as Draft</button>
                {campaignForm.id && campaignForm.status !== 'Active' && (
                    <button 
                      onClick={() => onActivate(campaignForm.id)}
                      disabled={!campaignForm.projectIds.length || !campaignForm.steps.length}
                      className="flex items-center bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PlayIcon className="w-5 h-5 mr-2" />
                      Activate Campaign
                    </button>
                )}
                {campaignForm.status === 'Active' && <p className="text-green-400 font-semibold">Campaign is Active</p>}
            </div>
        </div>
    );
    
    const renderPerformanceTab = () => (
        <div>
            <h3 className="font-bold text-lg my-2 text-white">Enrolled Leads ({enrolledLeads.length})</h3>
            <div className="overflow-auto max-h-96">
              <table className="w-full text-left">
                  <thead className="bg-slate-900"><tr className="border-b border-slate-700"><th className="p-3 text-sm text-slate-400">Company</th><th className="p-3 text-sm text-slate-400">Project</th><th className="p-3 text-sm text-slate-400">Current Step</th><th className="p-3 text-sm text-slate-400">Enrolled On</th></tr></thead>
                  <tbody>
                    {enrolledLeads.map(lead => (
                      <tr key={lead.id} className="border-b border-slate-800"><td className="p-3">{lead.companyName}</td><td className="p-3 text-slate-400">{lead.projectName}</td><td className="p-3 text-center">{lead.campaignStatus?.currentStep}</td><td className="p-3 text-slate-400">{new Date(lead.campaignStatus!.enrolledAt).toLocaleDateString()}</td></tr>
                    ))}
                  </tbody>
              </table>
              {enrolledLeads.length === 0 && <p className="text-center text-slate-400 p-4">No leads currently enrolled.</p>}
            </div>
        </div>
    );

    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">{campaignForm.name}</h2>
            <button onClick={onClose} className="text-sm text-slate-300 hover:text-white">&larr; Back to List</button>
        </div>

        <div className="flex border-b border-slate-700">
            <button
                onClick={() => setEditorTab('setup')}
                className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${editorTab === 'setup' ? 'text-violet-400 border-violet-400' : 'text-slate-400 border-transparent hover:text-white'}`}
            >
                Setup
            </button>
            <button
                onClick={() => setEditorTab('performance')}
                className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${editorTab === 'performance' ? 'text-violet-400 border-violet-400' : 'text-slate-400 border-transparent hover:text-white'}`}
            >
                Performance ({enrolledLeads.length})
            </button>
        </div>

        <div className="pt-4">
            {editorTab === 'setup' && renderSetupTab()}
            {editorTab === 'performance' && renderPerformanceTab()}
        </div>
      </div>
    );
};


interface OutreachPageProps {
  projects: Project[];
  campaigns: Campaign[];
  emailLogs: EmailLog[];
  onBulkUpdateEngagement: (projectId: string, subject: string) => void;
  onSingleLeadEngagementUpdate: (leadId: string, projectId: string, channel: 'email' | 'whatsapp', newStatus: EmailStatus | WhatsAppStatus, subject?: string) => void;
  onSaveCampaign: (campaign: Campaign) => void;
  onDeleteCampaign: (campaignId: string) => void;
  onActivateCampaign: (campaignId: string) => void;
  onResendEmail: (logId: string) => void;
}

const OutreachPage: React.FC<OutreachPageProps> = ({ projects, campaigns, emailLogs, onBulkUpdateEngagement, onSingleLeadEngagementUpdate, onSaveCampaign, onDeleteCampaign, onActivateCampaign, onResendEmail }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('campaign');
  
  // State for Campaign Sender Tab
  const [campaignSelectedProjectId, setCampaignSelectedProjectId] = useState<string>('all');
  const [channel, setChannel] = useState<'email' | 'whatsapp'>('email');
  const [subject, setSubject] = useState<string>('Following up');
  const [message, setMessage] = useState<string>('Hi {companyName},\n\nI came across your company and I\'d love to discuss how we can help.');
  const [selectedLeadId, setSelectedLeadId] = useState<string>('all');

  // State for Engagement Tracking Tab
  const [trackingSelectedProjectId, setTrackingSelectedProjectId] = useState<string>('all');
  const [emailFilter, setEmailFilter] = useState<EmailStatus | 'all'>('all');
  const [whatsappFilter, setWhatsappFilter] = useState<WhatsAppStatus | 'all'>('all');

  // State for Automated Campaigns Tab
  const [automationView, setAutomationView] = useState<'list' | 'editor'>('list');
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);
  const [campaignForm, setCampaignForm] = useState<Campaign | null>(null);
  
  // State for Email Logs Tab
  const [logSelectedProjectId, setLogSelectedProjectId] = useState<string>('all');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [viewingError, setViewingError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedLeadId('all');
  }, [campaignSelectedProjectId]);
  
  useEffect(() => {
    if (currentCampaign) {
      setCampaignForm(JSON.parse(JSON.stringify(currentCampaign)));
    } else {
      setCampaignForm(null);
    }
  }, [currentCampaign]);

  const allLeads = useMemo(() => projects.flatMap(p => p.leads.map(l => ({ ...l, projectId: p.id, projectName: p.name }))), [projects]);

  const currentProjectLeads = useMemo(() => {
    if (campaignSelectedProjectId === 'all') return [];
    const project = projects.find(p => p.id === campaignSelectedProjectId);
    return project ? project.leads : [];
  }, [projects, campaignSelectedProjectId]);
  
  const handleSendCampaign = () => {
    if (selectedLeadId !== 'all' && campaignSelectedProjectId !== 'all') {
      onSingleLeadEngagementUpdate(selectedLeadId, campaignSelectedProjectId, 'email', 'Sent', subject);
      alert(`Email for lead has been queued!`);
      return;
    }
    if (campaignSelectedProjectId !== 'all') {
      onBulkUpdateEngagement(campaignSelectedProjectId, subject);
      alert(`Emails for project ${projects.find(p => p.id === campaignSelectedProjectId)?.name} have been queued!`);
      return;
    }
    if (campaignSelectedProjectId === 'all') {
      if (confirm('This will queue emails for ALL leads in ALL projects. Proceed?')) {
        projects.forEach(p => onBulkUpdateEngagement(p.id, subject));
        alert(`Emails for ALL projects have been queued!`);
      }
    }
  };
  
  const filteredTrackingLeads = useMemo(() => {
    let leads = trackingSelectedProjectId === 'all'
      ? allLeads
      : allLeads.filter(l => l.projectId === trackingSelectedProjectId);
    if (emailFilter !== 'all') leads = leads.filter(l => l.engagement.emailStatus === emailFilter);
    if (whatsappFilter !== 'all') leads = leads.filter(l => l.engagement.whatsappStatus === whatsappFilter);
    return leads;
  }, [allLeads, trackingSelectedProjectId, emailFilter, whatsappFilter]);
  
  const filteredEmailLogs = useMemo(() => {
    const sortedLogs = [...emailLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
     if (logSelectedProjectId === 'all') return sortedLogs;
     return sortedLogs.filter(log => log.projectId === logSelectedProjectId);
  }, [emailLogs, logSelectedProjectId]);

  const handleCreateNewCampaign = () => {
    setCurrentCampaign({
      id: '', name: 'New Campaign', channel: 'email', status: 'Draft', projectIds: [], steps: [{ id: `step-${Date.now()}`, delayDays: 0, sendTime: '09:00', subject: 'Follow Up 1', body: 'Hi {companyName}, just following up.' }]
    });
    setAutomationView('editor');
  };
  
  const handleSaveCampaignForm = () => {
    if (campaignForm) {
      onSaveCampaign(campaignForm);
      alert('Campaign saved!');
      setAutomationView('list');
      setCurrentCampaign(null);
    }
  };

  const renderCampaignTab = () => (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col gap-6">
        <h2 className="text-xl font-bold text-white">Campaign Sender</h2>
        <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="flex flex-col gap-4">
                 <div>
                    <label htmlFor="campaign-project-filter" className="text-sm font-medium text-slate-400">Project</label>
                    <select
                        id="campaign-project-filter"
                        value={campaignSelectedProjectId}
                        onChange={(e) => setCampaignSelectedProjectId(e.target.value)}
                        className="mt-1 w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-2 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none transition"
                    >
                        <option value="all">All Projects</option>
                        {projects.map(project => ( <option key={project.id} value={project.id}>{project.name}</option> ))}
                    </select>
                </div>
                 <div>
                    <label htmlFor="lead-filter" className="text-sm font-medium text-slate-400">Target Lead</label>
                    <select
                        id="lead-filter"
                        value={selectedLeadId}
                        onChange={(e) => setSelectedLeadId(e.target.value)}
                        disabled={campaignSelectedProjectId === 'all' || currentProjectLeads.length === 0}
                        className="mt-1 w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-2 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <option value="all">All Leads in Project</option>
                        {currentProjectLeads.map(lead => ( <option key={lead.id} value={lead.id}>{lead.companyName}</option> ))}
                    </select>
                </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400">Channel</label>
              <div className="mt-1 flex gap-4">
                  <button onClick={() => setChannel('email')} className={`px-4 py-2 text-sm rounded-lg border ${channel === 'email' ? 'bg-violet-600 text-white border-violet-500' : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}`}>Email</button>
                  <button onClick={() => setChannel('whatsapp')} className={`px-4 py-2 text-sm rounded-lg border ${channel === 'whatsapp' ? 'bg-green-600 text-white border-green-500' : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}`}>WhatsApp</button>
              </div>
            </div>
        </div>
        <div>
            <label className="text-sm font-medium text-slate-400">Subject</label>
            <input 
                type="text" 
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="mt-1 w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-violet-500 focus:outline-none"
            />
        </div>
        <div>
            <label className="text-sm font-medium text-slate-400">Message</label>
            <p className="text-xs text-slate-500 mb-1">Use {'{companyName}'} as a placeholder.</p>
            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-violet-500 focus:outline-none"
            />
        </div>
        <button 
            onClick={handleSendCampaign}
            disabled={projects.length === 0 || channel !== 'email'}
            className="self-start bg-violet-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-violet-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={channel !== 'email' ? 'Manual WhatsApp sending not implemented' : ''}
        >
           {channel === 'email' ? 'Queue Emails for Sending' : 'Send via WhatsApp'}
        </button>
    </div>
  );

  const renderTrackingTab = () => (
     <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-xl font-bold mr-auto text-white">Engagement Tracking</h2>
             <div>
                <label htmlFor="tracking-project-filter" className="text-xs font-medium text-slate-400 mr-2">Project</label>
                <select 
                    id="tracking-project-filter"
                    value={trackingSelectedProjectId}
                    onChange={(e) => setTrackingSelectedProjectId(e.target.value)}
                    className="bg-slate-700 border border-slate-600 text-white rounded-lg p-2 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none transition"
                >
                    <option value="all">All Projects</option>
                    {projects.map(project => ( <option key={project.id} value={project.id}>{project.name}</option> ))}
                </select>
            </div>
            <div>
                <label htmlFor="email-filter" className="text-xs font-medium text-slate-400 mr-2">Email Status</label>
                <select id="email-filter" value={emailFilter} onChange={(e) => setEmailFilter(e.target.value as EmailStatus | 'all')} className="bg-slate-700 border border-slate-600 text-white rounded-lg p-2 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none transition">
                    <option value="all">All</option>
                    {EMAIL_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="whatsapp-filter" className="text-xs font-medium text-slate-400 mr-2">WhatsApp Status</label>
                 <select id="whatsapp-filter" value={whatsappFilter} onChange={(e) => setWhatsappFilter(e.target.value as WhatsAppStatus | 'all')} className="bg-slate-700 border border-slate-600 text-white rounded-lg p-2 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none transition">
                    <option value="all">All</option>
                    {WHATSAPP_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
                <thead className="bg-slate-900">
                    <tr className="border-b border-slate-700">
                        <th className="p-3 text-sm font-semibold text-slate-400">Company</th>
                        <th className="p-3 text-sm font-semibold text-slate-400">Email Status</th>
                        <th className="p-3 text-sm font-semibold text-slate-400">WhatsApp Status</th>
                        <th className="p-3 text-sm font-semibold text-slate-400">Last Contacted</th>
                        <th className="p-3 text-sm font-semibold text-slate-400 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTrackingLeads.map(lead => (
                        <tr key={lead.id} className="border-b border-slate-800 hover:bg-slate-700/50">
                            <td className="p-3 font-medium text-white">{lead.companyName}</td>
                            <td className="p-3"><EngagementStatusBadge status={lead.engagement.emailStatus} /></td>
                            <td className="p-3"><EngagementStatusBadge status={lead.engagement.whatsappStatus} /></td>
                            <td className="p-3 text-slate-400 text-sm">{lead.engagement.lastContacted ? new Date(lead.engagement.lastContacted).toLocaleDateString() : 'N/A'}</td>
                            <td className="p-3 text-center">
                                <div className="flex justify-center items-center gap-2">
                                     {lead.engagement.emailStatus === 'Sent' && ( <button onClick={() => onSingleLeadEngagementUpdate(lead.id, lead.projectId, 'email', 'Opened')} className="p-1.5 rounded-md hover:bg-slate-600 group" aria-label="Mark as Opened"><EyeIcon className="w-4 h-4 text-slate-400 group-hover:text-yellow-400" /></button> )}
                                     {lead.engagement.emailStatus === 'Opened' && ( <button onClick={() => onSingleLeadEngagementUpdate(lead.id, lead.projectId, 'email', 'Replied')} className="p-1.5 rounded-md hover:bg-slate-600 group" aria-label="Mark as Replied"><ReplyIcon className="w-4 h-4 text-slate-400 group-hover:text-green-400" /></button> )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {filteredTrackingLeads.length === 0 && <p className="text-center text-slate-400 py-8">No leads match the current filters.</p>}
        </div>
     </div>
  );
  
    const renderEmailLogsTab = () => (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
                <h2 className="text-xl font-bold mr-auto text-white">Email Sending Logs</h2>
                <div>
                    <label htmlFor="log-project-filter" className="text-xs font-medium text-slate-400 mr-2">Project</label>
                    <select
                        id="log-project-filter"
                        value={logSelectedProjectId}
                        onChange={(e) => setLogSelectedProjectId(e.target.value)}
                        className="bg-slate-700 border border-slate-600 text-white rounded-lg p-2 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none transition"
                    >
                        <option value="all">All Projects</option>
                        {projects.map(project => ( <option key={project.id} value={project.id}>{project.name}</option> ))}
                    </select>
                </div>
            </div>
             <div className="overflow-x-auto">
                 <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-slate-900">
                        <tr className="border-b border-slate-700">
                            <th className="p-3 text-sm font-semibold text-slate-400">Status</th>
                            <th className="p-3 text-sm font-semibold text-slate-400">Recipient</th>
                            <th className="p-3 text-sm font-semibold text-slate-400">Project</th>
                            <th className="p-3 text-sm font-semibold text-slate-400">Subject</th>
                            <th className="p-3 text-sm font-semibold text-slate-400">Time</th>
                            <th className="p-3 text-sm font-semibold text-slate-400 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmailLogs.map(log => (
                            <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-700/50">
                                <td className="p-3"><EmailLogStatusBadge status={log.status} /></td>
                                <td className="p-3 font-medium text-white">{log.leadName}</td>
                                <td className="p-3 text-slate-400 text-sm">{log.projectName}</td>
                                <td className="p-3 text-slate-300">{log.subject}</td>
                                <td className="p-3 text-slate-400 text-sm">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="p-3 text-center">
                                    {log.status === 'Error' && (
                                        <div className="flex justify-center items-center gap-3">
                                            <button 
                                                onClick={() => onResendEmail(log.id)}
                                                className="p-1.5 rounded-md hover:bg-slate-600 group" aria-label="Resend Email">
                                                <RetryIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
                                            </button>
                                            <button
                                                onClick={() => { setViewingError(log.errorMessage || 'No error details available.'); setIsErrorModalOpen(true); }}
                                                className="p-1.5 rounded-md hover:bg-slate-600 group" aria-label="View Error">
                                                <WarningIcon className="w-4 h-4 text-slate-400 group-hover:text-red-400" />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
                 {filteredEmailLogs.length === 0 && <p className="text-center text-slate-400 py-8">No email logs found.</p>}
             </div>
             {isErrorModalOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center animate-fade-in" onClick={() => setIsErrorModalOpen(false)}>
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-lg flex flex-col gap-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-red-300">Email Send Error</h3>
                        <pre className="bg-slate-900 p-4 rounded-md text-sm text-slate-300 whitespace-pre-wrap font-mono">{viewingError}</pre>
                        <button onClick={() => setIsErrorModalOpen(false)} className="self-end bg-slate-700 text-slate-200 font-semibold py-2 px-5 rounded-lg hover:bg-slate-600 transition-colors">Close</button>
                    </div>
                </div>
             )}
        </div>
    );

  const renderAutomationTab = () => {
    if (automationView === 'editor' && campaignForm) {
      return (
        <CampaignEditor
          campaignForm={campaignForm}
          setCampaignForm={setCampaignForm}
          projects={projects}
          allLeads={allLeads}
          onSave={handleSaveCampaignForm}
          onActivate={onActivateCampaign}
          onClose={() => setAutomationView('list')}
        />
      );
    }
    return renderCampaignList();
  };
  
  const renderCampaignList = () => (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Automated Campaigns</h2>
        <button onClick={handleCreateNewCampaign} className="flex items-center bg-violet-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-violet-500 transition-colors text-sm">
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Campaign
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-900">
            <tr className="border-b border-slate-700">
              <th className="p-3 text-sm font-semibold text-slate-400">Name</th>
              <th className="p-3 text-sm font-semibold text-slate-400">Status</th>
              <th className="p-3 text-sm font-semibold text-slate-400">Channel</th>
              <th className="p-3 text-sm font-semibold text-slate-400">Steps</th>
              <th className="p-3 text-sm font-semibold text-slate-400">Projects</th>
              <th className="p-3 text-sm font-semibold text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map(c => (
              <tr key={c.id} className="border-b border-slate-800 hover:bg-slate-700/50">
                <td className="p-3 font-medium text-white">{c.name}</td>
                <td className="p-3"><span className={`px-2 py-1 text-xs rounded-full ${c.status === 'Active' ? 'bg-green-800 text-green-200' : 'bg-slate-600 text-slate-300'}`}>{c.status}</span></td>
                <td className="p-3 text-slate-300">{c.channel}</td>
                <td className="p-3 text-slate-300">{c.steps.length}</td>
                <td className="p-3 text-slate-300">{c.projectIds.length}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => { setCurrentCampaign(c); setAutomationView('editor'); }} className="text-violet-400 hover:text-violet-300 text-sm font-semibold">Edit</button>
                  <button onClick={() => { if(confirm(`Delete "${c.name}"? This will un-enroll all leads.`)) onDeleteCampaign(c.id) }} className="text-red-400 hover:text-red-300 text-sm font-semibold">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {campaigns.length === 0 && <p className="text-center text-slate-400 py-8">No campaigns created yet.</p>}
      </div>
    </div>
  );
  

  const renderActiveTab = () => {
      switch(activeTab) {
          case 'campaign': return renderCampaignTab();
          case 'tracking': return renderTrackingTab();
          case 'automation': return renderAutomationTab();
          case 'logs': return renderEmailLogsTab();
          default: return null;
      }
  }

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in">
        <h1 className="text-4xl font-bold text-white">Marketing</h1>
      
      <div className="flex border-b border-slate-700 mb-4">
        <button onClick={() => setActiveTab('campaign')} className={`px-4 py-2 font-semibold border-b-2 transition-colors ${activeTab === 'campaign' ? 'text-violet-400 border-violet-400' : 'text-slate-400 border-transparent hover:text-white'}`}>
            Campaign Sender
        </button>
        <button onClick={() => setActiveTab('tracking')} className={`px-4 py-2 font-semibold border-b-2 transition-colors ${activeTab === 'tracking' ? 'text-violet-400 border-violet-400' : 'text-slate-400 border-transparent hover:text-white'}`}>
            Engagement Tracking
        </button>
        <button onClick={() => setActiveTab('automation')} className={`px-4 py-2 font-semibold border-b-2 transition-colors ${activeTab === 'automation' ? 'text-violet-400 border-violet-400' : 'text-slate-400 border-transparent hover:text-white'}`}>
            Automated Campaigns
        </button>
        <button onClick={() => setActiveTab('logs')} className={`px-4 py-2 font-semibold border-b-2 transition-colors ${activeTab === 'logs' ? 'text-violet-400 border-violet-400' : 'text-slate-400 border-transparent hover:text-white'}`}>
            Email Logs
        </button>
      </div>

      {projects.length === 0 ? (
        <p className="text-center text-slate-400 mt-8 text-lg">You haven't created any projects yet. Go create one to find leads!</p>
      ) : renderActiveTab()}
    </div>
  );
};

export default OutreachPage;
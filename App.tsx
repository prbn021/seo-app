/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import DashboardPage from './components/StartScreen';
import OutreachPage from './components/AdjustmentPanel';
import CrmPage from './components/FilterPanel';
import ProjectsSidebar from './components/ProjectsSidebar';
import ProjectsListPage from './components/DebugModal'; // Repurposed file
import ProjectDetailsPage from './components/EditorCanvas'; // Repurposed for Project Details
import SettingsPage from './components/SettingsPage'; // New Settings Page
import CreateProjectPage from './components/AddProductModal';
import ProfilePage from './components/ProfilePage'; // New Profile Page
import { findLeads } from './services/geminiService';

export type CrmStatus = 'New Lead' | 'Contacted' | 'Follow-up' | 'Negotiation' | 'Closed/Won';
export type EmailStatus = 'Not Sent' | 'Sent' | 'Opened' | 'Replied';
export type WhatsAppStatus = 'Not Sent' | 'Sent'; // Simplified for this example
export type EmailLogStatus = 'Queued' | 'Sent' | 'Error';
export type AppLogSeverity = 'Info' | 'Success' | 'Error';

export interface Engagement {
  emailStatus: EmailStatus;
  whatsappStatus: WhatsAppStatus;
  lastContacted: string | null;
}

export interface LeadCampaignStatus {
  campaignId: string;
  currentStep: number;
  enrolledAt: string;
}

export interface CampaignStep {
  id: string;
  delayDays: number;
  sendTime: string;
  subject: string;
  body: string;
}

export interface Campaign {
  id: string;
  name: string;
  channel: 'email' | 'whatsapp';
  status: 'Draft' | 'Active' | 'Archived';
  projectIds: string[];
  steps: CampaignStep[];
}


export interface Lead {
  id: string;
  companyName: string;
  url: string;
  email: string;
  phone: string;
  status: CrmStatus;
  engagement: Engagement;
  campaignStatus?: LeadCampaignStatus;
}

export interface Project {
  id: string;
  name: string;
  keyword: string;
  leads: Lead[];
}

export interface EmailLog {
    id: string;
    leadId: string;
    leadName: string;
    projectId: string;
    projectName: string;
    subject: string;
    status: EmailLogStatus;
    timestamp: string;
    errorMessage?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Member';
  status: 'Active' | 'Invited';
}

export interface ApiKey {
  id: string;
  service: string;
  key: string;
  addedDate: string;
}

export interface ProxyConfig {
  id: string;
  protocol: 'HTTP' | 'HTTPS' | 'SOCKS4' | 'SOCKS5';
  host: string;
  port: number;
  username?: string;
  password?: string;
  status: 'Active' | 'Inactive';
}

export interface AppLog {
    id: string;
    timestamp: string;
    severity: AppLogSeverity;
    action: string;
    details: string;
}

export const CRM_STATUSES: CrmStatus[] = ['New Lead', 'Contacted', 'Follow-up', 'Negotiation', 'Closed/Won'];

export type Page = 'dashboard' | 'prospecção' | 'marketing' | 'crm' | 'analytics' | 'perfil' | 'configurações' | 'projectDetails' | 'createProject';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [selectedProjectIdForDetails, setSelectedProjectIdForDetails] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appLogs, setAppLogs] = useState<AppLog[]>([]);

  const [users, setUsers] = useState<User[]>([
    { id: 'user-1', name: 'Alex Johnson', email: 'alex.j@example.com', role: 'Admin', status: 'Active' },
    { id: 'user-2', name: 'Maria Garcia', email: 'maria.g@example.com', role: 'Member', status: 'Active' },
    { id: 'user-3', name: 'Chen Wei', email: 'chen.w@example.com', role: 'Member', status: 'Invited' },
  ]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { id: 'api-1', service: 'Google Gemini API', key: 'AIzaSy*********************************5678', addedDate: '2023-11-15' },
    { id: 'api-2', service: 'OpenAI API', key: 'sk-**********************************1234', addedDate: '2023-10-26' },
  ]);
  const [proxies, setProxies] = useState<ProxyConfig[]>([
    { id: 'proxy-1', protocol: 'HTTP', host: '192.168.1.1', port: 8080, username: 'user1', status: 'Active' },
    { id: 'proxy-2', protocol: 'SOCKS5', host: 'proxy.example.com', port: 1080, status: 'Inactive' },
  ]);
  const [currentUser, setCurrentUser] = useState<User>(users[0]); // Mock current user
  
  const logEvent = useCallback((severity: AppLogSeverity, action: string, details: string) => {
    const newLog: AppLog = {
      id: `applog-${Date.now()}`,
      timestamp: new Date().toISOString(),
      severity,
      action,
      details,
    };
    setAppLogs(prev => [newLog, ...prev].slice(0, 100)); // Keep last 100 logs
  }, []);

  // Log initial activity for demo
  useEffect(() => {
    if (appLogs.length === 0) {
      logEvent('Info', 'Nova campanha criada', 'Campanha "Q4 SaaS Outreach" foi criada.');
      logEvent('Success', 'Lead convertido: StartupXYZ', 'O lead foi movido para a coluna Closed/Won.');
      logEvent('Info', 'Email enviado para 50 leads', 'Campanha de email "Introdução SaaS" foi disparada.');
      logEvent('Success', 'Novo lead capturado: Tech Solutions', 'Lead capturado através da prospecção por palavra-chave "erp para manufatura".');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClearLogs = useCallback(() => {
    setAppLogs([]);
  }, []);

    // Effect to simulate processing the email queue
    useEffect(() => {
        const interval = setInterval(() => {
            const queuedEmail = emailLogs.find(log => log.status === 'Queued');
            if (queuedEmail) {
                // Simulate send result
                const isSuccess = Math.random() > 0.15; // 85% success rate
                const errorMessage = 'SMTP connection failed: Timeout while connecting to server.';
                
                setEmailLogs(prevLogs => prevLogs.map(log => {
                    if (log.id === queuedEmail.id) {
                        return {
                            ...log,
                            status: isSuccess ? 'Sent' : 'Error',
                            errorMessage: isSuccess ? undefined : errorMessage
                        };
                    }
                    return log;
                }));
                
                if (isSuccess) {
                    logEvent('Success', 'Email Sent', `Successfully sent email "${queuedEmail.subject}" to ${queuedEmail.leadName}.`);
                } else {
                    logEvent('Error', 'Email Send Failed', `Failed to send email to ${queuedEmail.leadName}. Reason: ${errorMessage}`);
                }


                // If successful, update the lead's engagement status
                if (isSuccess) {
                    setProjects(prevProjects => prevProjects.map(project => {
                        if (project.id === queuedEmail.projectId) {
                            const updatedLeads = project.leads.map(lead => {
                                if (lead.id === queuedEmail.leadId) {
                                    return {
                                        ...lead,
                                        engagement: {
                                            ...lead.engagement,
                                            // FIX: Explicitly cast 'Sent' to EmailStatus to resolve TS inference issue.
                                            emailStatus: 'Sent' as EmailStatus,
                                            lastContacted: new Date().toISOString()
                                        }
                                    };
                                }
                                return lead;
                            });
                            return { ...project, leads: updatedLeads };
                        }
                        return project;
                    }));
                }
            }
        }, 2000); // Process one email every 2 seconds

        return () => clearInterval(interval);
    }, [emailLogs, logEvent]);


    const handleSaveProject = useCallback((keyword: string, leads: Omit<Lead, 'id' | 'status'>[]) => {
        const leadsWithId = leads.map(lead => ({
          ...lead,
          id: `${lead.companyName}-${Date.now()}-${Math.random()}`,
          status: 'New Lead' as CrmStatus,
          engagement: {
            emailStatus: 'Not Sent' as EmailStatus,
            whatsappStatus: 'Not Sent' as WhatsAppStatus,
            lastContacted: null,
          },
        }));
        
        const newProject: Project = {
          id: `${keyword}-${Date.now()}`,
          name: keyword,
          keyword: keyword,
          leads: leadsWithId,
        };
  
        setProjects(prevProjects => [...prevProjects, newProject]);
        logEvent('Success', 'Project Created', `New project "${keyword}" created with ${leads.length} leads.`);
        handleSelectProject(newProject.id);
      }, [logEvent]);

  const updateLeadStatus = useCallback((leadId: string, projectId: string, newStatus: CrmStatus) => {
    setProjects(prevProjects => prevProjects.map(project => {
      if (project.id === projectId) {
        const updatedLeads = project.leads.map(lead =>
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        );
        return { ...project, leads: updatedLeads };
      }
      return project;
    }));
  }, []);

  const updateLeadDetails = useCallback((leadId: string, projectId: string, updatedLeadData: Partial<Omit<Lead, 'id' | 'status' | 'engagement'>>) => {
    setProjects(prevProjects => prevProjects.map(project => {
      if (project.id === projectId) {
        const updatedLeads = project.leads.map(lead =>
          lead.id === leadId ? { ...lead, ...updatedLeadData } : lead
        );
        return { ...project, leads: updatedLeads };
      }
      return project;
    }));
  }, []);
  
    const handleQueueNewEmail = useCallback((lead: Lead, project: Project, subject: string) => {
        const newLog: EmailLog = {
            id: `log-${Date.now()}-${Math.random()}`,
            leadId: lead.id,
            leadName: lead.companyName,
            projectId: project.id,
            projectName: project.name,
            subject: subject,
            status: 'Queued',
            timestamp: new Date().toISOString(),
        };
        setEmailLogs(prev => [...prev, newLog]);
        logEvent('Info', 'Email Queued', `Email "${subject}" to ${lead.companyName} has been queued for sending.`);
    }, [logEvent]);

    const handleBulkUpdateEngagement = useCallback((projectId: string, subject: string) => {
        const projectToUpdate = projects.find(p => p.id === projectId);
        if (projectToUpdate) {
            projectToUpdate.leads.forEach(lead => handleQueueNewEmail(lead, projectToUpdate, subject));
        }
    }, [projects, handleQueueNewEmail]);
  
    const handleSingleLeadEngagementUpdate = useCallback((
        leadId: string,
        projectId: string,
        channel: 'email' | 'whatsapp',
        newStatus: EmailStatus | WhatsAppStatus,
        subject?: string,
    ) => {
        if (channel === 'email' && newStatus === 'Sent') {
            const project = projects.find(p => p.id === projectId);
            const lead = project?.leads.find(l => l.id === leadId);
            if (project && lead) {
                handleQueueNewEmail(lead, project, subject || `Message to ${lead.companyName}`);
            }
        } else {
             // Handle other status updates (Opened, Replied, WhatsApp) directly
            setProjects(prevProjects => prevProjects.map(project => {
                if (project.id === projectId) {
                    const updatedLeads = project.leads.map(lead => {
                        if (lead.id === leadId) {
                            const newEngagement = {
                                ...lead.engagement,
                                lastContacted: new Date().toISOString(),
                            };
                            if (channel === 'email') newEngagement.emailStatus = newStatus as EmailStatus;
                            else if (channel === 'whatsapp') newEngagement.whatsappStatus = newStatus as WhatsAppStatus;
                            return { ...lead, engagement: newEngagement };
                        }
                        return lead;
                    });
                    return { ...project, leads: updatedLeads };
                }
                return project;
            }));
        }
    }, [projects, handleQueueNewEmail]);

    const handleResendEmail = useCallback((logId: string) => {
        const logToResend = emailLogs.find(l => l.id === logId);
        if (logToResend) {
             const newLog: EmailLog = {
                ...logToResend,
                id: `log-${Date.now()}-${Math.random()}`,
                status: 'Queued',
                timestamp: new Date().toISOString(),
                errorMessage: undefined,
            };
            setEmailLogs(prev => [...prev, newLog]);
            logEvent('Info', 'Email Resend', `Re-queued email "${logToResend.subject}" for ${logToResend.leadName}.`);
        }
    }, [emailLogs, logEvent]);
  
    const handleSaveCampaign = useCallback((campaignToSave: Campaign) => {
        const isNew = !campaignToSave.id;
        setCampaigns(prev => {
            if (isNew) {
                const newCampaign = { ...campaignToSave, id: `camp-${Date.now()}` };
                logEvent('Success', 'Campaign Created', `New campaign "${newCampaign.name}" was created.`);
                return [...prev, newCampaign];
            } else {
                logEvent('Info', 'Campaign Updated', `Campaign "${campaignToSave.name}" was updated.`);
                return prev.map(c => c.id === campaignToSave.id ? campaignToSave : c);
            }
        });
    }, [logEvent]);

    const handleDeleteCampaign = useCallback((campaignId: string) => {
        const campaignName = campaigns.find(c => c.id === campaignId)?.name || 'Unknown';
        setCampaigns(prev => prev.filter(c => c.id !== campaignId));
        // Un-enroll all leads from this campaign
        setProjects(prevProjects => prevProjects.map(project => ({
            ...project,
            leads: project.leads.map(lead => {
                if (lead.campaignStatus?.campaignId === campaignId) {
                    const { campaignStatus, ...rest } = lead;
                    return rest as Lead;
                }
                return lead;
            })
        })));
        logEvent('Info', 'Campaign Deleted', `Campaign "${campaignName}" was deleted.`);
    }, [campaigns, logEvent]);

    const handleActivateCampaign = useCallback((campaignId: string) => {
        const campaignToActivate = campaigns.find(c => c.id === campaignId);
        if (!campaignToActivate || campaignToActivate.status === 'Active') return;

        setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: 'Active' } : c));
        logEvent('Success', 'Campaign Activated', `Campaign "${campaignToActivate.name}" was activated.`);

        // Enroll leads and queue first email
        const firstStep = campaignToActivate.steps[0];
        if (!firstStep) return;

        setProjects(prevProjects => {
            const updatedProjects = prevProjects.map(project => {
                if (campaignToActivate.projectIds.includes(project.id)) {
                    const updatedLeads = project.leads.map(lead => {
                        if (!lead.campaignStatus) { // Enroll only if not already in a campaign
                             if(campaignToActivate.channel === 'email') {
                                handleQueueNewEmail(lead, project, firstStep.subject);
                             }
                            // In a real app, you'd also queue WhatsApp messages
                            return {
                                ...lead,
                                campaignStatus: {
                                    campaignId: campaignId,
                                    currentStep: 1,
                                    enrolledAt: new Date().toISOString(),
                                }
                            };
                        }
                        return lead;
                    });
                    return { ...project, leads: updatedLeads };
                }
                return project;
            });
            return updatedProjects;
        });
    }, [campaigns, handleQueueNewEmail, logEvent]);

  const handleSaveUser = useCallback((userToSave: User) => {
    const isNew = !userToSave.id;
    setUsers(prev => {
        if (isNew) {
            const newUser = { ...userToSave, id: `user-${Date.now()}` };
            logEvent('Success', 'User Added', `New user "${newUser.name}" was added.`);
            return [...prev, newUser];
        } else {
            logEvent('Info', 'User Updated', `User profile for "${userToSave.name}" was updated.`);
            return prev.map(u => u.id === userToSave.id ? userToSave : u);
        }
    });
  }, [logEvent]);

  const handleDeleteUser = useCallback((userId: string) => {
    const userName = users.find(u => u.id === userId)?.name || 'Unknown';
    setUsers(prev => prev.filter(u => u.id !== userId));
    logEvent('Info', 'User Deleted', `User "${userName}" was deleted.`);
  }, [users, logEvent]);

  const handleSaveApiKey = useCallback((keyToSave: ApiKey) => {
      const isNew = !keyToSave.id;
      setApiKeys(prev => {
          if (isNew) {
              const newKey = { ...keyToSave, id: `api-${Date.now()}` };
              logEvent('Success', 'API Key Added', `A new key for "${newKey.service}" was added.`);
              return [...prev, newKey];
          } else {
              logEvent('Info', 'API Key Updated', `API Key for "${keyToSave.service}" was updated.`);
              return prev.map(k => k.id === keyToSave.id ? keyToSave : k);
          }
      });
  }, [logEvent]);

  const handleDeleteApiKey = useCallback((keyId: string) => {
      const keyService = apiKeys.find(k => k.id === keyId)?.service || 'Unknown';
      setApiKeys(prev => prev.filter(k => k.id !== keyId));
      logEvent('Info', 'API Key Deleted', `API Key for "${keyService}" was deleted.`);
  }, [apiKeys, logEvent]);

  const handleUpdateProfile = useCallback((updatedProfile: Partial<User>) => {
      setCurrentUser(prev => ({ ...prev, ...updatedProfile }));
      // Also update the user in the main list
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...updatedProfile } : u));
      logEvent('Success', 'Profile Updated', `Current user "${currentUser.name}" updated their profile.`);
      alert('Profile updated successfully!');
  }, [currentUser.id, currentUser.name, logEvent]);

    const handleSaveProxy = useCallback((proxyToSave: ProxyConfig) => {
    const isNew = !proxyToSave.id;
    setProxies(prev => {
        if (isNew) {
            const newProxy = { ...proxyToSave, id: `proxy-${Date.now()}` };
            logEvent('Success', 'Proxy Added', `New proxy "${newProxy.host}:${newProxy.port}" was added.`);
            return [...prev, newProxy];
        } else {
            logEvent('Info', 'Proxy Updated', `Proxy "${proxyToSave.host}:${proxyToSave.port}" was updated.`);
            return prev.map(p => p.id === proxyToSave.id ? proxyToSave : p);
        }
    });
  }, [logEvent]);

  const handleDeleteProxy = useCallback((proxyId: string) => {
    const proxyHost = proxies.find(p => p.id === proxyId)?.host || 'Unknown';
    setProxies(prev => prev.filter(p => p.id !== proxyId));
    logEvent('Info', 'Proxy Deleted', `Proxy "${proxyHost}" was deleted.`);
  }, [proxies, logEvent]);

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectIdForDetails(projectId);
    setActivePage('projectDetails');
  };

  const renderContent = () => {
    if (error) {
       return (
           <div className="text-center animate-fade-in bg-slate-900 border border-red-500/30 p-8 rounded-xl max-w-2xl mx-auto flex flex-col items-center gap-4">
            <h2 className="text-2xl font-bold text-red-300">An Error Occurred</h2>
            <p className="text-md text-red-400">{error}</p>
            <button
                onClick={() => setError(null)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg text-md transition-colors"
              >
                Try Again
            </button>
          </div>
        );
    }

    switch (activePage) {
        case 'dashboard':
            return <DashboardPage projects={projects} appLogs={appLogs} onNavigate={setActivePage} />;
        case 'prospecção':
            const allLeads = projects.flatMap(p => p.leads);
            return <ProjectsListPage projects={projects} allLeadsCount={allLeads.length} onSelectProject={handleSelectProject} onCreateNew={() => setActivePage('createProject')} />;
        case 'createProject':
             return <CreateProjectPage onSaveProject={handleSaveProject} onError={setError} logEvent={logEvent}/>;
        case 'projectDetails': {
            const project = projects.find(p => p.id === selectedProjectIdForDetails);
            if (!project) {
                setActivePage('prospecção');
                return null;
            }
            return <ProjectDetailsPage project={project} onUpdateLead={updateLeadDetails} appLogs={appLogs} />;
        }
        case 'marketing':
            return <OutreachPage 
                projects={projects}
                campaigns={campaigns}
                emailLogs={emailLogs}
                onBulkUpdateEngagement={handleBulkUpdateEngagement}
                onSingleLeadEngagementUpdate={handleSingleLeadEngagementUpdate}
                onSaveCampaign={handleSaveCampaign}
                onDeleteCampaign={handleDeleteCampaign}
                onActivateCampaign={handleActivateCampaign}
                onResendEmail={handleResendEmail}
            />;
        case 'crm':
            return <CrmPage projects={projects} onUpdateLeadStatus={updateLeadStatus} />;
        case 'analytics':
            return <div className="w-full text-center"><h1 className="text-3xl font-bold">Analytics</h1><p className="text-slate-400 mt-4">Analytics dashboard coming soon!</p></div>;
        case 'perfil':
            return <ProfilePage currentUser={currentUser} onUpdateProfile={handleUpdateProfile} />;
        case 'configurações':
            return <SettingsPage
                users={users}
                apiKeys={apiKeys}
                proxies={proxies}
                appLogs={appLogs}
                onSaveUser={handleSaveUser}
                onDeleteUser={handleDeleteUser}
                onSaveApiKey={handleSaveApiKey}
                onDeleteApiKey={handleDeleteApiKey}
                onClearLogs={handleClearLogs}
                onSaveProxy={handleSaveProxy}
                onDeleteProxy={handleDeleteProxy}
            />;
        default:
            return <DashboardPage projects={projects} appLogs={appLogs} onNavigate={setActivePage} />;
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex">
      <ProjectsSidebar 
        activePage={activePage}
        setActivePage={setActivePage}
      />
      <div className="flex-grow flex flex-col">
        <Header onNavigate={setActivePage} />
        <main className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="w-full max-w-7xl mx-auto">
             {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
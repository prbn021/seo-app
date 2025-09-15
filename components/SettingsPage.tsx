/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo } from 'react';
import type { User, ApiKey, AppLog, AppLogSeverity, ProxyConfig } from '../App';
import { UserIcon, KeyIcon, SearchIcon, PlusIcon, EditIcon, TrashIcon, SendIcon, DocumentTextIcon, ServerIcon, InformationCircleIcon } from './icons';

type SettingsTab = 'users' | 'keys' | 'logs' | 'proxies';

interface SettingsPageProps {
    users: User[];
    apiKeys: ApiKey[];
    proxies: ProxyConfig[];
    appLogs: AppLog[];
    onSaveUser: (user: User) => void;
    onDeleteUser: (userId: string) => void;
    onSaveApiKey: (apiKey: ApiKey) => void;
    onDeleteApiKey: (apiKeyId: string) => void;
    onClearLogs: () => void;
    onSaveProxy: (proxy: ProxyConfig) => void;
    onDeleteProxy: (proxyId: string) => void;
}

// All sub-components are moved to the top-level of the module to prevent invalid hook call errors.

const UserModal: React.FC<{user: User, onSave: (u: User) => void, onClose: () => void}> = ({ user, onSave, onClose }) => {
    const [form, setForm] = useState(user);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({...form, [e.target.name]: e.target.value});
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(form); onClose(); };
    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4 text-white">{form.id ? 'Edit User' : 'Add User'}</h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"/>
                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email Address" className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"/>
                    <select name="role" value={form.role} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white">
                        <option>Member</option><option>Admin</option>
                    </select>
                    <div className="flex justify-end gap-2 mt-2"><button type="button" onClick={onClose} className="py-2 px-4 rounded bg-slate-600">Cancel</button><button type="submit" className="py-2 px-4 rounded bg-violet-600">Save</button></div>
                </form>
            </div>
        </div>
    );
};

const UserManagementTab: React.FC<{users: User[], onSave: (u: User) => void, onDelete: (id: string) => void}> = ({ users, onSave, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const filteredUsers = useMemo(() => users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    ), [users, searchTerm]);

    const handleAddNew = () => {
        setEditingUser({ id: '', name: '', email: '', role: 'Member', status: 'Invited' });
        setIsModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };
    
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative w-full md:w-1/3">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-2 pl-10 focus:ring-2 focus:ring-violet-500 focus:outline-none"/>
                </div>
                <button onClick={handleAddNew} className="flex items-center justify-center bg-violet-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-violet-500 transition-colors text-sm"><PlusIcon className="w-4 h-4 mr-2"/>Add User</button>
            </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-900"><tr className="border-b border-slate-700"><th className="p-3 text-sm text-slate-400">Name</th><th className="p-3 text-sm text-slate-400">Email</th><th className="p-3 text-sm text-slate-400">Role</th><th className="p-3 text-sm text-slate-400">Status</th><th className="p-3 text-sm text-slate-400">Actions</th></tr></thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="border-b border-slate-800">
                                <td className="p-3 font-medium text-white">{user.name}</td>
                                <td className="p-3 text-slate-300">{user.email}</td>
                                <td className="p-3 text-slate-300">{user.role}</td>
                                <td className="p-3"><span className={`px-2 py-1 text-xs rounded-full ${user.status === 'Active' ? 'bg-green-800 text-green-200' : 'bg-yellow-800 text-yellow-200'}`}>{user.status}</span></td>
                                <td className="p-3 flex items-center gap-2">
                                    <button onClick={() => alert(`Password reset sent to ${user.email}`)} className="p-1.5 rounded-md hover:bg-slate-700 group" aria-label="Send Reset"><SendIcon className="w-4 h-4 text-slate-400 group-hover:text-violet-400"/></button>
                                    <button onClick={() => handleEdit(user)} className="p-1.5 rounded-md hover:bg-slate-700 group" aria-label="Edit"><EditIcon className="w-4 h-4 text-slate-400 group-hover:text-yellow-400"/></button>
                                    <button onClick={() => confirm('Delete this user?') && onDelete(user.id)} className="p-1.5 rounded-md hover:bg-slate-700 group" aria-label="Delete"><TrashIcon className="w-4 h-4 text-slate-400 group-hover:text-red-400"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && editingUser && <UserModal user={editingUser} onSave={onSave} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
}

const ApiKeyModal: React.FC<{apiKey: ApiKey, onSave: (k: ApiKey) => void, onClose: () => void}> = ({ apiKey, onSave, onClose }) => {
    const [form, setForm] = useState(apiKey);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, [e.target.name]: e.target.value});
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(form); onClose(); };
    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4 text-white">{form.id ? 'Edit API Key' : 'Add API Key'}</h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input name="service" value={form.service} onChange={handleChange} placeholder="Service Name (e.g., Google Gemini)" className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"/>
                    <input name="key" value={form.key} onChange={handleChange} placeholder="API Key" className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"/>
                    <div className="flex justify-end gap-2 mt-2"><button type="button" onClick={onClose} className="py-2 px-4 rounded bg-slate-600">Cancel</button><button type="submit" className="py-2 px-4 rounded bg-violet-600">Save</button></div>
                </form>
            </div>
        </div>
    );
};

const ApiKeysTab: React.FC<{apiKeys: ApiKey[], onSave: (k: ApiKey) => void, onDelete: (id: string) => void}> = ({ apiKeys, onSave, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingKey, setEditingKey] = useState<ApiKey | null>(null);

    const handleAddNew = () => {
        setEditingKey({ id: '', service: '', key: '', addedDate: new Date().toISOString().split('T')[0]});
        setIsModalOpen(true);
    };
    const handleEdit = (apiKey: ApiKey) => {
        setEditingKey(apiKey);
        setIsModalOpen(true);
    };

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-4">
            <div className="flex justify-end">
                <button onClick={handleAddNew} className="flex items-center justify-center bg-violet-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-violet-500 transition-colors text-sm"><PlusIcon className="w-4 h-4 mr-2"/>Add API Key</button>
            </div>
            <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-900"><tr className="border-b border-slate-700"><th className="p-3 text-sm text-slate-400">Service</th><th className="p-3 text-sm text-slate-400">Key</th><th className="p-3 text-sm text-slate-400">Added On</th><th className="p-3 text-sm text-slate-400">Actions</th></tr></thead>
                    <tbody>
                        {apiKeys.map(apiKey => (
                             <tr key={apiKey.id} className="border-b border-slate-800">
                                <td className="p-3 font-medium text-white">{apiKey.service}</td>
                                <td className="p-3 text-slate-300 font-mono text-sm">{apiKey.key}</td>
                                <td className="p-3 text-slate-300">{apiKey.addedDate}</td>
                                <td className="p-3 flex items-center gap-2">
                                    <button onClick={() => handleEdit(apiKey)} className="p-1.5 rounded-md hover:bg-slate-700 group" aria-label="Edit"><EditIcon className="w-4 h-4 text-slate-400 group-hover:text-yellow-400"/></button>
                                    <button onClick={() => confirm('Delete this API key?') && onDelete(apiKey.id)} className="p-1.5 rounded-md hover:bg-slate-700 group" aria-label="Delete"><TrashIcon className="w-4 h-4 text-slate-400 group-hover:text-red-400"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {isModalOpen && editingKey && <ApiKeyModal apiKey={editingKey} onSave={onSave} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
}

const LogSeverityBadge: React.FC<{ severity: AppLogSeverity }> = ({ severity }) => {
    const colorClasses = {
        'Info': 'bg-blue-800 text-blue-200',
        'Success': 'bg-green-800 text-green-200',
        'Error': 'bg-red-800 text-red-200',
    }[severity];
    return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colorClasses}`}>{severity}</span>;
};

const LogDetailsModal: React.FC<{log: AppLog, onClose: () => void}> = ({ log, onClose }) => (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={onClose}>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4 text-white">Log Details</h3>
            <div className="space-y-3 text-sm">
                <p><strong className="text-slate-400 w-24 inline-block">Timestamp:</strong> <span className="font-mono">{new Date(log.timestamp).toISOString()}</span></p>
                <p><strong className="text-slate-400 w-24 inline-block">Severity:</strong> <LogSeverityBadge severity={log.severity} /></p>
                <p><strong className="text-slate-400 w-24 inline-block">Action:</strong> {log.action}</p>
                <div>
                    <strong className="text-slate-400 block mb-1">Details:</strong>
                    <pre className="bg-slate-900 p-3 rounded-md text-slate-300 whitespace-pre-wrap font-mono">{log.details}</pre>
                </div>
            </div>
            <div className="flex justify-end mt-4">
                <button onClick={onClose} className="py-2 px-4 rounded bg-slate-600">Close</button>
            </div>
        </div>
    </div>
);


const ApplicationLogsTab: React.FC<{logs: AppLog[], onClear: () => void}> = ({ logs, onClear }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSeverity, setFilterSeverity] = useState<AppLogSeverity | 'All'>('All');
    const [viewingLog, setViewingLog] = useState<AppLog | null>(null);

    const filteredLogs = useMemo(() => logs.filter(log => {
        const severityMatch = filterSeverity === 'All' || log.severity === filterSeverity;
        const searchMatch = !searchTerm || log.action.toLowerCase().includes(searchTerm.toLowerCase()) || log.details.toLowerCase().includes(searchTerm.toLowerCase());
        return severityMatch && searchMatch;
    }), [logs, searchTerm, filterSeverity]);

    const severities: (AppLogSeverity | 'All')[] = ['All', 'Info', 'Success', 'Error'];

    return (
         <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex-grow flex flex-col sm:flex-row gap-4 w-full">
                    <div className="relative flex-grow">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="text" placeholder="Search logs..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-2 pl-10 focus:ring-2 focus:ring-violet-500 focus:outline-none"/>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                        {severities.map(s => (
                             <button 
                                key={s} 
                                onClick={() => setFilterSeverity(s)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${filterSeverity === s ? 'bg-violet-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
                             >{s}</button>
                        ))}
                    </div>
                </div>
                <button onClick={() => confirm('Are you sure you want to clear all logs?') && onClear()} className="flex-shrink-0 bg-red-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors text-sm w-full md:w-auto">Clear Logs</button>
            </div>
            <div className="overflow-x-auto max-h-[60vh]">
                <table className="w-full text-left min-w-[700px]">
                    <thead className="bg-slate-900">
                        <tr className="border-b border-slate-700">
                            <th className="p-3 text-sm text-slate-400">Severity</th>
                            <th className="p-3 text-sm text-slate-400">Timestamp</th>
                            <th className="p-3 text-sm text-slate-400">Action</th>
                            <th className="p-3 text-sm text-slate-400">Details</th>
                            <th className="p-3 text-sm text-slate-400"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map(log => (
                            <tr key={log.id} className="border-b border-slate-800">
                                <td className="p-3"><LogSeverityBadge severity={log.severity} /></td>
                                <td className="p-3 text-sm text-slate-400 font-mono whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="p-3 font-semibold text-white">{log.action}</td>
                                <td className="p-3 text-slate-300 text-sm max-w-sm truncate">{log.details}</td>
                                <td className="p-3 text-center">
                                    <button onClick={() => setViewingLog(log)} className="p-1.5 rounded-md hover:bg-slate-700 group" aria-label="View full log">
                                        <InformationCircleIcon className="w-5 h-5 text-slate-400 group-hover:text-violet-400" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredLogs.length === 0 && <p className="text-center text-slate-400 py-8">No logs match the current filters.</p>}
            </div>
            {viewingLog && <LogDetailsModal log={viewingLog} onClose={() => setViewingLog(null)} />}
         </div>
    );
}

const ProxyModal: React.FC<{proxy: ProxyConfig, onSave: (p: ProxyConfig) => void, onClose: () => void}> = ({ proxy, onSave, onClose }) => {
    const [form, setForm] = useState(proxy);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: name === 'port' ? parseInt(value) || 0 : value }));
    };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(form); onClose(); };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4 text-white">{form.id ? 'Edit Proxy' : 'Add Proxy'}</h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <select name="protocol" value={form.protocol} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white">
                            <option>HTTP</option><option>HTTPS</option><option>SOCKS4</option><option>SOCKS5</option>
                        </select>
                        <select name="status" value={form.status} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white">
                            <option>Active</option><option>Inactive</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                         <input name="host" value={form.host} onChange={handleChange} placeholder="Host / IP Address" className="col-span-2 w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"/>
                         <input type="number" name="port" value={form.port} onChange={handleChange} placeholder="Port" className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <input name="username" value={form.username || ''} onChange={handleChange} placeholder="Username (optional)" className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"/>
                         <input type="password" name="password" value={form.password || ''} onChange={handleChange} placeholder="Password (optional)" className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"/>
                    </div>
                    <div className="flex justify-end gap-2 mt-2"><button type="button" onClick={onClose} className="py-2 px-4 rounded bg-slate-600">Cancel</button><button type="submit" className="py-2 px-4 rounded bg-violet-600">Save</button></div>
                </form>
            </div>
        </div>
    );
};


const ProxiesTab: React.FC<{proxies: ProxyConfig[], onSave: (p: ProxyConfig) => void, onDelete: (id: string) => void}> = ({ proxies, onSave, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProxy, setEditingProxy] = useState<ProxyConfig | null>(null);

    const handleAddNew = () => {
        setEditingProxy({ id: '', protocol: 'HTTP', host: '', port: 8080, status: 'Active' });
        setIsModalOpen(true);
    };
    const handleEdit = (proxy: ProxyConfig) => {
        setEditingProxy(proxy);
        setIsModalOpen(true);
    };

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-4">
            <div className="flex justify-end">
                <button onClick={handleAddNew} className="flex items-center justify-center bg-violet-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-violet-500 transition-colors text-sm"><PlusIcon className="w-4 h-4 mr-2"/>Add Proxy</button>
            </div>
            <div className="overflow-x-auto">
                 <table className="w-full text-left min-w-[700px]">
                    <thead className="bg-slate-900">
                        <tr className="border-b border-slate-700">
                            <th className="p-3 text-sm text-slate-400">Status</th>
                            <th className="p-3 text-sm text-slate-400">Host</th>
                            <th className="p-3 text-sm text-slate-400">Port</th>
                            <th className="p-3 text-sm text-slate-400">Protocol</th>
                            <th className="p-3 text-sm text-slate-400">Username</th>
                            <th className="p-3 text-sm text-slate-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {proxies.map(proxy => (
                             <tr key={proxy.id} className="border-b border-slate-800">
                                <td className="p-3"><span className={`px-2 py-1 text-xs rounded-full ${proxy.status === 'Active' ? 'bg-green-800 text-green-200' : 'bg-slate-600 text-slate-300'}`}>{proxy.status}</span></td>
                                <td className="p-3 font-medium font-mono text-white">{proxy.host}</td>
                                <td className="p-3 text-slate-300">{proxy.port}</td>
                                <td className="p-3 text-slate-300">{proxy.protocol}</td>
                                <td className="p-3 text-slate-300">{proxy.username || 'N/A'}</td>
                                <td className="p-3 flex items-center gap-2">
                                    <button onClick={() => handleEdit(proxy)} className="p-1.5 rounded-md hover:bg-slate-700 group" aria-label="Edit"><EditIcon className="w-4 h-4 text-slate-400 group-hover:text-yellow-400"/></button>
                                    <button onClick={() => confirm('Delete this proxy?') && onDelete(proxy.id)} className="p-1.5 rounded-md hover:bg-slate-700 group" aria-label="Delete"><TrashIcon className="w-4 h-4 text-slate-400 group-hover:text-red-400"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {isModalOpen && editingProxy && <ProxyModal proxy={editingProxy} onSave={onSave} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
}


const SettingsPage: React.FC<SettingsPageProps> = (props) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('users');

    const renderContent = () => {
        switch (activeTab) {
            case 'users': return <UserManagementTab users={props.users} onSave={props.onSaveUser} onDelete={props.onDeleteUser} />;
            case 'keys': return <ApiKeysTab apiKeys={props.apiKeys} onSave={props.onSaveApiKey} onDelete={props.onDeleteApiKey} />;
            case 'logs': return <ApplicationLogsTab logs={props.appLogs} onClear={props.onClearLogs} />;
            case 'proxies': return <ProxiesTab proxies={props.proxies} onSave={props.onSaveProxy} onDelete={props.onDeleteProxy} />;
            default: return null;
        }
    };
    
    const navItems = [
        { id: 'users', name: 'User Management', icon: <UserIcon className="w-5 h-5 mr-2"/> },
        { id: 'keys', name: 'API Keys', icon: <KeyIcon className="w-5 h-5 mr-2"/> },
        { id: 'logs', name: 'Application Logs', icon: <DocumentTextIcon className="w-5 h-5 mr-2" /> },
        { id: 'proxies', name: 'Proxies', icon: <ServerIcon className="w-5 h-5 mr-2" /> },
    ];

    return (
        <div className="w-full flex flex-col gap-6 animate-fade-in">
            <h1 className="text-4xl font-bold text-white">Configurações</h1>
            <div className="flex border-b border-slate-700/80 mb-4 justify-start">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as SettingsTab)}
                        className={`flex items-center px-4 py-2 font-semibold border-b-2 transition-colors ${activeTab === item.id ? 'text-violet-400 border-violet-400' : 'text-slate-400 border-transparent hover:text-white'}`}
                    >
                        {item.icon}
                        {item.name}
                    </button>
                ))}
            </div>
            {renderContent()}
        </div>
    );
};

export default SettingsPage;
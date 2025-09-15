/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import type { User } from '../App';

interface ProfilePageProps {
    currentUser: User;
    onUpdateProfile: (updatedProfile: Partial<User>) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, onUpdateProfile }) => {
    const [form, setForm] = useState({ name: currentUser.name, email: currentUser.email });
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

    const handleInfoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateProfile(form);
    };
    
    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            alert("New passwords don't match!");
            return;
        }
        if (!passwords.new) {
            alert("New password cannot be empty.");
            return;
        }
        alert('Password changed successfully! (Simulation)');
        setPasswords({ current: '', new: '', confirm: '' });
    };

    return (
        <div className="w-full flex flex-col gap-6 animate-fade-in">
            <h1 className="text-4xl font-bold text-white">Perfil</h1>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-white">Personal Information</h3>
                    <form onSubmit={handleInfoSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="text-sm text-slate-400">Full Name</label>
                            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="mt-1 w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"/>
                        </div>
                        <div>
                            <label className="text-sm text-slate-400">Email Address</label>
                            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="mt-1 w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"/>
                        </div>
                        <button type="submit" className="self-start py-2 px-4 rounded bg-violet-600 mt-2">Update Information</button>
                    </form>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-white">Change Password</h3>
                    <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
                        <input type="password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} placeholder="Current Password" className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"/>
                        <input type="password" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} placeholder="New Password" className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"/>
                        <input type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} placeholder="Confirm New Password" className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"/>
                        <button type="submit" className="self-start py-2 px-4 rounded bg-violet-600 mt-2">Change Password</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// THIS FILE HAS BEEN REPURPOSED AS THE EMAIL MODAL
// This component is a modal for sending emails to a lead.

import React from 'react';
import type { Lead } from '../App';

interface EmailModalProps {
  lead: Lead;
  onClose: () => void;
}

const EmailModal: React.FC<EmailModalProps> = ({ lead, onClose }) => {

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would integrate with an email service API
    alert(`Email sent to ${lead.companyName}! (Simulation)`);
    onClose();
  };

  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl p-6 w-full max-w-2xl flex flex-col gap-4 shadow-2xl"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Compose Email</h2>
             <button onClick={onClose} className="text-slate-400 hover:text-white text-3xl leading-none">&times;</button>
        </div>
        
        <form onSubmit={handleSendEmail} className="flex flex-col gap-4">
            <div>
                <label className="text-sm font-medium text-slate-400">To</label>
                <input
                    type="email"
                    readOnly
                    value={lead.email}
                    className="mt-1 w-full bg-slate-900/70 border border-slate-700 text-slate-300 rounded-lg p-3"
                />
            </div>
             <div>
                <label className="text-sm font-medium text-slate-400">Subject</label>
                <input
                    type="text"
                    placeholder={`Following up with ${lead.companyName}`}
                    className="mt-1 w-full bg-slate-700/80 border border-slate-600 text-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
            </div>
            <div>
                <label className="text-sm font-medium text-slate-400">Body</label>
                <textarea
                    rows={8}
                    placeholder="Write your message..."
                    className="mt-1 w-full bg-slate-700/80 border border-slate-600 text-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
            </div>
            <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={onClose} className="bg-slate-700 text-slate-200 font-semibold py-2 px-5 rounded-lg hover:bg-slate-600 transition-colors">
                    Cancel
                </button>
                <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-500 transition-colors">
                    Send Email
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default EmailModal;
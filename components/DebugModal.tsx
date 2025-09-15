/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// THIS FILE HAS BEEN REPURPOSED AS THE PROJECTS LIST PAGE

import React, { useState, useMemo } from 'react';
import type { Project } from '../App';
// FIX: Import PlusIcon to be used in the "Create New Project" button.
import { SearchIcon, ProjectIcon, PlusIcon } from './icons';

interface ProjectsListPageProps {
  projects: Project[];
  // FIX: Added allLeadsCount to props to display total leads.
  allLeadsCount: number;
  onSelectProject: (projectId: string) => void;
  // FIX: Added onCreateNew to props for the "Create New Project" button functionality.
  onCreateNew: () => void;
}

const ProjectsListPage: React.FC<ProjectsListPageProps> = ({ projects, allLeadsCount, onSelectProject, onCreateNew }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) {
      return projects;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return projects.filter(
      project =>
        project.name.toLowerCase().includes(lowercasedFilter) ||
        project.keyword.toLowerCase().includes(lowercasedFilter)
    );
  }, [projects, searchTerm]);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold text-white">All Projects</h1>
          <p className="text-slate-400 mt-1">{projects.length} projects found with a total of {allLeadsCount} leads.</p>
        </div>
        <button onClick={onCreateNew} className="bg-violet-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-violet-500 transition-colors flex items-center justify-center w-full sm:w-auto">
          <PlusIcon className="w-5 h-5 mr-2" />
          Create New Project
        </button>
      </div>
      
      <div className="relative w-full max-w-lg mx-auto">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or keyword..."
              className="w-full bg-slate-900/70 border border-slate-700 text-slate-200 rounded-lg p-3 pl-12 text-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
      </div>

      {projects.length === 0 ? (
        <div className="text-center text-slate-400 mt-8 text-lg">
          You haven't created any projects yet. Click 'Create New Project' to start.
        </div>
      ) : filteredProjects.length === 0 ? (
        <p className="text-center text-slate-400 mt-8 text-lg">No projects match your search.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map(project => (
            <button 
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 flex flex-col gap-2 text-left hover:bg-slate-700/50 hover:border-blue-500/50 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="bg-slate-900/80 p-2 rounded-md">
                    <ProjectIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-100 truncate">{project.name}</h3>
                    <p className="text-sm text-slate-400 truncate">{project.keyword}</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-700 text-xs text-slate-400">
                {project.leads.length} leads
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsListPage;
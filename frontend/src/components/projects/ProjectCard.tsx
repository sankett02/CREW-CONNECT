import React from 'react';
import { Calendar, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProjectCardProps {
    project: {
        id: string;
        title: string;
        description: string;
        niche: string;
        budget: string;
        deadline: string;
    };
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
    return (
        <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full uppercase tracking-wider">
                    {project.niche}
                </span>
                <div className="flex items-center text-accent font-bold">
                    <DollarSign size={16} />
                    <span>{project.budget}</span>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                <p className="text-sm text-text-muted line-clamp-2">{project.description}</p>
            </div>

            <div className="flex items-center gap-4 text-xs text-text-muted pt-2 border-t border-border">
                <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{new Date(project.deadline).toLocaleDateString()}</span>
                </div>
            </div>

            <Link to={`/projects/${project.id}`} className="mt-2 flex items-center justify-center gap-2 py-3 bg-glass-bg border border-border rounded-xl text-sm font-medium hover:bg-primary hover:border-primary transition-all group">
                View Project
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    );
};

export default ProjectCard;

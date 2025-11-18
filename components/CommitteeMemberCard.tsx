
import React from 'react';
import type { CommitteeMember } from '../types';

interface CommitteeMemberCardProps {
  member: CommitteeMember;
}

const CommitteeMemberCard: React.FC<CommitteeMemberCardProps> = ({ member }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 text-center transition-transform transform hover:-translate-y-2 hover:shadow-2xl flex flex-col items-center h-full">
      <div className="w-32 h-32 mb-4 relative">
        {member.image ? (
          <img 
            src={member.image} 
            alt={member.name} 
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-sm"
          />
        ) : (
          <div className="w-full h-full bg-blue-800 rounded-full flex items-center justify-center border-4 border-blue-200 shadow-sm">
            <span className="text-white text-xl font-bold uppercase px-2">{member.avatarText}</span>
          </div>
        )}
      </div>
      <h4 className="text-xl font-semibold text-blue-800">{member.name}</h4>
      <p className="text-gray-500 mt-1 text-sm uppercase tracking-wide">{member.role}</p>
    </div>
  );
};

export default CommitteeMemberCard;

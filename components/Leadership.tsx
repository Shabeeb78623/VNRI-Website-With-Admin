
import React from 'react';
import CommitteeMemberCard from './CommitteeMemberCard';
import { useApp } from '../context/AppContext';
import type { CommitteeMember } from '../types';

const CommitteeSection: React.FC<{ title: string; members: CommitteeMember[] }> = ({ title, members }) => (
  <div className="mt-16">
    <h3 className="text-3xl font-bold text-center text-gray-800">{title}</h3>
    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {members.map((member) => (
        <CommitteeMemberCard key={member.id} member={member} />
      ))}
    </div>
  </div>
);

const Leadership: React.FC = () => {
  const { data } = useApp();

  return (
    <section id="committee" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-blue-800">Our Leadership</h2>
          <p className="mt-4 text-lg text-gray-600">
            Meet the teams guiding our community.
          </p>
        </div>
        
        <CommitteeSection title="Main Committee" members={data.mainCommittee} />
        <CommitteeSection title="Balavedhi Committee" members={data.balavedhiCommittee} />
      </div>
    </section>
  );
};

export default Leadership;

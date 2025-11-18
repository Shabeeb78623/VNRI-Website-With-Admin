
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { CommitteeMember, GalleryImage } from '../../types';

const Dashboard: React.FC = () => {
  const { data, updateData, logout, navigateTo } = useApp();
  const [activeTab, setActiveTab] = useState<'main' | 'balavedhi' | 'gallery'>('main');

  // Helper to generate simple IDs
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Helper to convert file to base64
  const handleFileUpload = (file: File, callback: (base64: string) => void) => {
    if (file.size > 1024 * 1024) { // 1MB limit
      alert("File is too large! Please upload an image smaller than 1MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        callback(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // --- Member Logic ---
  const handleAddMember = (listType: 'main' | 'balavedhi') => {
    const newMember: CommitteeMember = {
      id: generateId(),
      name: 'New Member',
      role: 'Role',
      avatarText: 'NM',
      image: ''
    };
    
    const newData = { ...data };
    if (listType === 'main') newData.mainCommittee.push(newMember);
    else newData.balavedhiCommittee.push(newMember);
    updateData(newData);
  };

  const handleUpdateMember = (listType: 'main' | 'balavedhi', id: string, field: keyof CommitteeMember, value: string) => {
    const newData = { ...data };
    const list = listType === 'main' ? newData.mainCommittee : newData.balavedhiCommittee;
    const member = list.find(m => m.id === id);
    if (member) {
      (member as any)[field] = value;
      updateData(newData);
    }
  };

  const handleDeleteMember = (listType: 'main' | 'balavedhi', id: string) => {
    if (!window.confirm('Are you sure you want to remove this member? This cannot be undone.')) return;
    
    // Create a deep clone to ensure state updates trigger re-renders correctly
    const newData = JSON.parse(JSON.stringify(data));
    
    if (listType === 'main') {
      newData.mainCommittee = newData.mainCommittee.filter((m: CommitteeMember) => m.id !== id);
    } else {
      newData.balavedhiCommittee = newData.balavedhiCommittee.filter((m: CommitteeMember) => m.id !== id);
    }
    
    updateData(newData);
  };

  // --- Gallery Logic ---
  const handleAddImage = () => {
    const newImage: GalleryImage = {
      id: generateId(),
      src: 'https://picsum.photos/seed/new/600/400',
      alt: 'New Event'
    };
    const newData = { ...data };
    newData.galleryImages.push(newImage);
    updateData(newData);
  };

  const handleUpdateImage = (id: string, field: keyof GalleryImage, value: string) => {
    const newData = { ...data };
    const img = newData.galleryImages.find(i => i.id === id);
    if (img) {
      (img as any)[field] = value;
      updateData(newData);
    }
  };

  const handleDeleteImage = (id: string) => {
    if (!window.confirm('Delete this image?')) return;
    const newData = { ...data };
    newData.galleryImages = newData.galleryImages.filter(i => i.id !== id);
    updateData(newData);
  };

  const renderMemberEditor = (listType: 'main' | 'balavedhi', members: CommitteeMember[]) => (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg">
        <h3 className="text-xl font-bold text-blue-900">{listType === 'main' ? 'Main Committee' : 'Balavedhi Committee'}</h3>
        <button 
          onClick={() => handleAddMember(listType)} 
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 shadow-md transition-colors font-semibold"
        >
          + Add Member
        </button>
      </div>
      
      {members.length === 0 && (
        <p className="text-center text-gray-500 py-8">No members in this committee yet.</p>
      )}

      <div className="grid gap-6">
        {members.map(member => (
          <div key={member.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col md:flex-row gap-6 items-start">
            
            {/* Image Upload Section */}
            <div className="flex flex-col items-center space-y-2 min-w-[120px]">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 bg-gray-100 relative group">
                {member.image ? (
                  <img src={member.image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-1">No Photo</div>
                )}
                <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white text-xs font-bold">
                  Change
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0], (base64) => handleUpdateMember(listType, member.id, 'image', base64));
                      }
                    }} 
                  />
                </label>
              </div>
              <button 
                onClick={() => handleUpdateMember(listType, member.id, 'image', '')}
                className="text-xs text-red-500 hover:text-red-700 underline"
              >
                Remove Photo
              </button>
            </div>

            {/* Details Form */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Name</label>
                <input 
                  type="text" 
                  value={member.name} 
                  onChange={(e) => handleUpdateMember(listType, member.id, 'name', e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                  placeholder="Full Name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Role / Position</label>
                <input 
                  type="text" 
                  value={member.role} 
                  onChange={(e) => handleUpdateMember(listType, member.id, 'role', e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                  placeholder="e.g. President"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Placeholder Initials</label>
                <input 
                  type="text" 
                  value={member.avatarText} 
                  onChange={(e) => handleUpdateMember(listType, member.id, 'avatarText', e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                  placeholder="e.g. PR (Shown if no photo)"
                />
              </div>
            </div>

            {/* Delete Action */}
            <div className="self-end md:self-center">
              <button 
                onClick={() => handleDeleteMember(listType, member.id)} 
                className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800 px-4 py-2 rounded-lg font-medium transition-colors border border-red-200"
              >
                Delete Member
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <nav className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-6 py-4 flex flex-wrap gap-4 justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="flex gap-3">
          <button 
            onClick={() => navigateTo('home')} 
            className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg transition-colors text-sm font-medium"
          >
            View Live Website
          </button>
          <button 
            onClick={logout} 
            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
          <button 
            onClick={() => setActiveTab('main')}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'main' ? 'bg-white text-blue-900 shadow-md' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
          >
            Main Committee
          </button>
          <button 
            onClick={() => setActiveTab('balavedhi')}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'balavedhi' ? 'bg-white text-blue-900 shadow-md' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
          >
            Balavedhi
          </button>
          <button 
            onClick={() => setActiveTab('gallery')}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'gallery' ? 'bg-white text-blue-900 shadow-md' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
          >
            Gallery
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 min-h-[500px]">
          {activeTab === 'main' && renderMemberEditor('main', data.mainCommittee)}
          {activeTab === 'balavedhi' && renderMemberEditor('balavedhi', data.balavedhiCommittee)}
          
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-blue-900">Event Gallery</h3>
                <button 
                  onClick={handleAddImage} 
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 shadow-md transition-colors font-semibold"
                >
                  + Add New Image
                </button>
              </div>

              {data.galleryImages.length === 0 && (
                <p className="text-center text-gray-500 py-8">Gallery is empty.</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.galleryImages.map(img => (
                  <div key={img.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative group w-full h-48 rounded-lg overflow-hidden bg-gray-200">
                       <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                       <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white font-bold">
                          Upload New Photo
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleFileUpload(e.target.files[0], (base64) => handleUpdateImage(img.id, 'src', base64));
                              }
                            }} 
                          />
                        </label>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
                        <input 
                        type="text" 
                        value={img.alt} 
                        onChange={(e) => handleUpdateImage(img.id, 'alt', e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none" 
                        placeholder="Description"
                        />
                    </div>

                    <div className="flex justify-end mt-auto pt-2">
                         <button 
                            onClick={() => handleDeleteImage(img.id)} 
                            className="text-red-600 text-sm font-medium hover:bg-red-100 px-3 py-1 rounded transition-colors"
                         >
                            Delete Image
                         </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

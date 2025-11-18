import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { CommitteeMember, GalleryImage } from '../../types';

const Dashboard: React.FC = () => {
  const { 
    data, 
    logout, 
    navigateTo, 
    saveMember, 
    deleteMember, 
    saveGalleryImage, 
    deleteGalleryImage 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'main' | 'balavedhi' | 'gallery'>('main');
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // --- Image Compression Logic ---
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // Resize logic: Max width 800px
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Convert to JPEG with 0.7 quality (good balance for size)
          resolve(canvas.toDataURL('image/jpeg', 0.7)); 
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileUpload = async (file: File, id: string, callback: (base64: string) => void) => {
    try {
      setUploadingId(id);
      const base64 = await compressImage(file);
      await callback(base64);
    } catch (error) {
      console.error("Compression failed", error);
      alert("Failed to process image.");
    } finally {
      setUploadingId(null);
    }
  };

  // --- Member Logic ---
  const handleAddMember = (listType: 'main' | 'balavedhi') => {
    const newMember: CommitteeMember = {
      id: generateId(),
      name: 'New Member',
      role: 'Member Role',
      avatarText: 'NM',
      image: ''
    };
    saveMember(listType, newMember);
  };

  const handleUpdateMember = (listType: 'main' | 'balavedhi', member: CommitteeMember, field: keyof CommitteeMember, value: string) => {
    const updatedMember = { ...member, [field]: value };
    saveMember(listType, updatedMember);
  };

  const handleDeleteMember = (listType: 'main' | 'balavedhi', id: string) => {
    if (window.confirm('Are you sure?')) {
      deleteMember(listType, id);
    }
  };

  // --- Gallery Logic ---
  const handleAddImage = () => {
    const newImage: GalleryImage = {
      id: generateId(),
      src: 'https://picsum.photos/seed/new/600/400',
      alt: 'New Event Description'
    };
    saveGalleryImage(newImage);
  };

  const handleUpdateImage = (img: GalleryImage, field: keyof GalleryImage, value: string) => {
    const updatedImg = { ...img, [field]: value };
    saveGalleryImage(updatedImg);
  };

  const handleDeleteImage = (id: string) => {
    if (window.confirm('Delete this image?')) {
      deleteGalleryImage(id);
    }
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
      
      <div className="grid gap-6">
        {members.map(member => (
          <div key={member.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col md:flex-row gap-6 items-start">
            {/* Image Upload */}
            <div className="flex flex-col items-center space-y-2 min-w-[120px]">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 bg-gray-100 relative group">
                {uploadingId === member.id ? (
                  <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-50 text-white text-xs">Processing...</div>
                ) : member.image ? (
                  <img src={member.image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Photo</div>
                )}
                <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white text-xs font-bold">
                  Change
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(e.target.files[0], member.id, (base64) => handleUpdateMember(listType, member, 'image', base64));
                      }
                    }} 
                  />
                </label>
              </div>
              <button onClick={() => handleUpdateMember(listType, member, 'image', '')} className="text-xs text-red-500 underline">Remove</button>
            </div>

            {/* Inputs */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Name</label>
                <input 
                  type="text" 
                  value={member.name} 
                  onChange={(e) => handleUpdateMember(listType, member, 'name', e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded focus:ring-blue-500 outline-none" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Role</label>
                <input 
                  type="text" 
                  value={member.role} 
                  onChange={(e) => handleUpdateMember(listType, member, 'role', e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded focus:ring-blue-500 outline-none" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Initials</label>
                <input 
                  type="text" 
                  value={member.avatarText} 
                  onChange={(e) => handleUpdateMember(listType, member, 'avatarText', e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded focus:ring-blue-500 outline-none" 
                />
              </div>
            </div>

            <button onClick={() => handleDeleteMember(listType, member.id)} className="text-red-600 border border-red-200 px-4 py-2 rounded hover:bg-red-50 transition-colors">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <nav className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-6 py-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <h1 className="text-xl md:text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-3">
          <button onClick={() => navigateTo('home')} className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg text-sm">View Site</button>
          <button onClick={logout} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm">Logout</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
          <button onClick={() => setActiveTab('main')} className={`px-6 py-3 rounded-lg font-bold ${activeTab === 'main' ? 'bg-white text-blue-900 shadow-md' : 'bg-gray-200 text-gray-600'}`}>Main Committee</button>
          <button onClick={() => setActiveTab('balavedhi')} className={`px-6 py-3 rounded-lg font-bold ${activeTab === 'balavedhi' ? 'bg-white text-blue-900 shadow-md' : 'bg-gray-200 text-gray-600'}`}>Balavedhi</button>
          <button onClick={() => setActiveTab('gallery')} className={`px-6 py-3 rounded-lg font-bold ${activeTab === 'gallery' ? 'bg-white text-blue-900 shadow-md' : 'bg-gray-200 text-gray-600'}`}>Gallery</button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 min-h-[500px]">
          {activeTab === 'main' && renderMemberEditor('main', data.mainCommittee)}
          {activeTab === 'balavedhi' && renderMemberEditor('balavedhi', data.balavedhiCommittee)}
          
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-blue-900">Event Gallery</h3>
                <button onClick={handleAddImage} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 shadow-md font-semibold">+ Add Image</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.galleryImages.map(img => (
                  <div key={img.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-col gap-4">
                    <div className="relative group w-full h-48 rounded-lg overflow-hidden bg-gray-200">
                       {uploadingId === img.id ? (
                         <div className="flex items-center justify-center h-full w-full text-gray-600">Processing...</div>
                       ) : (
                         <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                       )}
                       <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white font-bold">
                          Upload Photo
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleFileUpload(e.target.files[0], img.id, (base64) => handleUpdateImage(img, 'src', base64));
                              }
                            }} 
                          />
                        </label>
                    </div>
                    <input 
                      type="text" 
                      value={img.alt} 
                      onChange={(e) => handleUpdateImage(img, 'alt', e.target.value)}
                      className="w-full border border-gray-300 p-2 rounded text-sm outline-none" 
                      placeholder="Description"
                    />
                    <div className="flex justify-end mt-auto pt-2">
                         <button onClick={() => handleDeleteImage(img.id)} className="text-red-600 text-sm hover:bg-red-100 px-3 py-1 rounded">Delete</button>
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
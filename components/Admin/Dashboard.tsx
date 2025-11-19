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
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleDeleteMember = async (listType: 'main' | 'balavedhi', id: string) => {
    if (window.confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
      setDeletingId(id);
      await deleteMember(listType, id);
      setDeletingId(null);
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

  const handleDeleteImage = async (id: string) => {
    if (window.confirm('Delete this image?')) {
      setDeletingId(id);
      await deleteGalleryImage(id);
      setDeletingId(null);
    }
  };

  const renderMemberEditor = (listType: 'main' | 'balavedhi', members: CommitteeMember[]) => (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg">
        <h3 className="text-xl font-bold text-blue-900">{listType === 'main' ? 'Main Committee' : 'Balavedhi Committee'}</h3>
        <button 
          onClick={() => handleAddMember(listType)} 
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 shadow-md transition-colors font-semibold flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          Add Member
        </button>
      </div>
      
      <div className="grid gap-6">
        {members.map(member => (
          <div key={member.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col md:flex-row gap-6 items-start animate-fade-in">
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
              <button onClick={() => handleUpdateMember(listType, member, 'image', '')} className="text-xs text-red-500 underline">Remove Photo</button>
            </div>

            {/* Inputs */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Name</label>
                <input 
                  type="text" 
                  value={member.name} 
                  onChange={(e) => handleUpdateMember(listType, member, 'name', e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded focus:ring-blue-500 outline-none focus:border-blue-500" 
                  placeholder="Name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Role</label>
                <input 
                  type="text" 
                  value={member.role} 
                  onChange={(e) => handleUpdateMember(listType, member, 'role', e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded focus:ring-blue-500 outline-none focus:border-blue-500" 
                  placeholder="Role"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Initials (for avatar)</label>
                <input 
                  type="text" 
                  value={member.avatarText} 
                  onChange={(e) => handleUpdateMember(listType, member, 'avatarText', e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded focus:ring-blue-500 outline-none focus:border-blue-500" 
                  placeholder="Initials"
                />
              </div>
            </div>

            <button 
              onClick={() => handleDeleteMember(listType, member.id)} 
              disabled={deletingId === member.id}
              className={`px-4 py-2 rounded transition-colors flex items-center justify-center min-w-[100px] ${
                deletingId === member.id 
                  ? 'bg-red-100 text-red-400 cursor-wait' 
                  : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300'
              }`}
            >
              {deletingId === member.id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        ))}
        
        {members.length === 0 && (
          <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            No members found. Click "Add Member" to start.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-20">
      <nav className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-6 py-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold">Admin Dashboard</h1>
            <span className="bg-blue-700 text-xs px-2 py-1 rounded-full text-blue-100">VNRI</span>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigateTo('home')} className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors">View Site</button>
          <button onClick={logout} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition-colors shadow-sm">Logout</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <button onClick={() => setActiveTab('main')} className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 ${activeTab === 'main' ? 'bg-blue-900 text-white shadow-lg scale-105' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Main Committee</button>
          <button onClick={() => setActiveTab('balavedhi')} className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 ${activeTab === 'balavedhi' ? 'bg-blue-900 text-white shadow-lg scale-105' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Balavedhi</button>
          <button onClick={() => setActiveTab('gallery')} className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 ${activeTab === 'gallery' ? 'bg-blue-900 text-white shadow-lg scale-105' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Gallery</button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 min-h-[500px]">
          {activeTab === 'main' && renderMemberEditor('main', data.mainCommittee)}
          {activeTab === 'balavedhi' && renderMemberEditor('balavedhi', data.balavedhiCommittee)}
          
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-blue-900">Event Gallery</h3>
                <button onClick={handleAddImage} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 shadow-md font-semibold flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  Add Image
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.galleryImages.map(img => (
                  <div key={img.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-col gap-4 hover:shadow-md transition-shadow">
                    <div className="relative group w-full h-48 rounded-lg overflow-hidden bg-gray-200">
                       {uploadingId === img.id ? (
                         <div className="flex items-center justify-center h-full w-full text-gray-600 bg-gray-100">
                            <div className="animate-pulse">Compressing...</div>
                         </div>
                       ) : (
                         <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                       )}
                       <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white font-bold">
                          <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                          <span className="block w-full text-center">Upload Photo</span>
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
                      className="w-full border border-gray-300 p-2 rounded text-sm outline-none focus:border-blue-500" 
                      placeholder="Event Description"
                    />
                    <div className="flex justify-end mt-auto pt-2">
                         <button 
                          onClick={() => handleDeleteImage(img.id)} 
                          disabled={deletingId === img.id}
                          className={`text-sm px-3 py-1 rounded transition-colors ${
                             deletingId === img.id ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:bg-red-100'
                          }`}
                         >
                          {deletingId === img.id ? 'Deleting...' : 'Delete Image'}
                         </button>
                    </div>
                  </div>
                ))}
                 {data.galleryImages.length === 0 && (
                  <div className="col-span-full text-center py-10 text-gray-500">
                    No images in gallery.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
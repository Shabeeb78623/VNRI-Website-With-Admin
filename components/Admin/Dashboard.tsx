
import React, { useState, useEffect } from 'react';
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
    deleteGalleryImage,
    saveSiteSettings,
    dbError
  } = useApp();

  const [activeTab, setActiveTab] = useState<'main' | 'balavedhi' | 'gallery' | 'settings'>('main');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showRulesModal, setShowRulesModal] = useState(false);
  
  // Settings Local State
  const [settingsTitle, setSettingsTitle] = useState(data.siteSettings.title);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // --- Image Compression Logic ---
  // Updated to accept maxWidth to allow smaller processing for favicons
  const compressImage = (file: File, maxWidth: number = 800): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        if (event.target?.result) {
            img.src = event.target.result as string;
            img.onload = () => {
            const canvas = document.createElement('canvas');
            // Resize logic
            const scaleSize = maxWidth / img.width;
            // If image is smaller than max, don't upscale
            const finalScale = scaleSize < 1 ? scaleSize : 1;
            
            canvas.width = img.width * finalScale;
            canvas.height = img.height * finalScale;
            
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Convert to JPEG with 0.7 quality to stay well within Firestore 1MB limit
            resolve(canvas.toDataURL('image/jpeg', 0.7)); 
            };
            img.onerror = (err) => reject(err);
        } else {
            reject(new Error("File read failed"));
        }
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileUpload = async (file: File, id: string, callback: (base64: string) => void, maxWidth: number = 800) => {
    try {
      setUploadingId(id);
      const base64 = await compressImage(file, maxWidth);
      // Ensure we are passing a string
      if (typeof base64 === 'string') {
          await callback(base64);
      } else {
          throw new Error("Image processing returned non-string data");
      }
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
    if (window.confirm('Are you sure you want to delete this member?')) {
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

  // --- Settings Logic ---
  const handleLogoUpload = async (file: File) => {
    handleFileUpload(file, 'logo', async (base64) => {
      await saveSiteSettings({ ...data.siteSettings, logo: base64 });
    }, 800);
  };

  const handleFaviconUpload = async (file: File) => {
    handleFileUpload(file, 'favicon', async (base64) => {
      await saveSiteSettings({ ...data.siteSettings, favicon: base64 });
    }, 192); // Smaller size for favicon
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    await saveSiteSettings({ ...data.siteSettings, title: settingsTitle });
    setIsSavingSettings(false);
  };

  const handleRemoveLogo = async () => {
    if(window.confirm('Remove logo?')) {
      await saveSiteSettings({ ...data.siteSettings, logo: '' });
    }
  };

  const handleRemoveFavicon = async () => {
    if(window.confirm('Remove favicon?')) {
      await saveSiteSettings({ ...data.siteSettings, favicon: '' });
    }
  };

  // Reusable Input Component to handle blur saving (prevents spamming Firestore)
  // Updated to use controlled state to prevent defaultValue issues
  const AutosaveInput = ({ 
    value, 
    onSave, 
    placeholder 
  }: { value: string, onSave: (val: string) => void, placeholder: string }) => {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value || '');
    }, [value]);

    const handleBlur = () => {
        if (localValue !== value) {
            onSave(localValue);
        }
    };

    return (
        <input 
        type="text" 
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        className="w-full border border-gray-300 p-2 rounded focus:ring-blue-500 outline-none focus:border-blue-500 transition-colors" 
        placeholder={placeholder}
        />
    );
  };

  const renderMemberEditor = (listType: 'main' | 'balavedhi', members: CommitteeMember[]) => (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
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
          <div key={member.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col md:flex-row gap-6 items-start animate-fade-in hover:shadow-lg transition-shadow">
            {/* Image Upload */}
            <div className="flex flex-col items-center space-y-2 min-w-[120px]">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 bg-gray-100 relative group shadow-inner">
                {uploadingId === member.id ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black bg-opacity-60 text-white text-xs z-20">
                    <svg className="animate-spin h-5 w-5 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Uploading
                  </div>
                ) : member.image ? (
                  <img src={member.image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Photo</div>
                )}
                <label className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white text-xs font-bold z-10">
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
              <button onClick={() => handleUpdateMember(listType, member, 'image', '')} className="text-xs text-red-500 hover:text-red-700 underline">Remove Photo</button>
            </div>

            {/* Inputs - Using AutosaveInput to prevent spam */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</label>
                <AutosaveInput 
                  value={member.name} 
                  onSave={(val) => handleUpdateMember(listType, member, 'name', val)} 
                  placeholder="Name" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</label>
                <AutosaveInput 
                  value={member.role} 
                  onSave={(val) => handleUpdateMember(listType, member, 'role', val)} 
                  placeholder="Role" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Initials</label>
                <AutosaveInput 
                  value={member.avatarText} 
                  onSave={(val) => handleUpdateMember(listType, member, 'avatarText', val)} 
                  placeholder="Initials" 
                />
              </div>
            </div>

            <button 
              onClick={() => handleDeleteMember(listType, member.id)} 
              disabled={deletingId === member.id}
              className={`px-4 py-2 rounded transition-colors flex items-center justify-center min-w-[100px] h-10 self-center md:self-start mt-4 md:mt-6 ${
                deletingId === member.id 
                  ? 'bg-red-100 text-red-400 cursor-wait' 
                  : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300 shadow-sm'
              }`}
            >
              {deletingId === member.id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        ))}
        
        {members.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <p>No members found.</p>
            <button onClick={() => handleAddMember(listType)} className="mt-2 text-blue-600 font-bold hover:underline">Add your first member</button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-20 relative">
      {/* DB Locked Warning Banner */}
      {dbError === 'permission-denied' && (
        <div className="bg-red-600 text-white px-4 py-3 shadow-lg z-50 sticky top-0">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
               </svg>
               <div>
                 <p className="font-bold">Database Access Blocked</p>
                 <p className="text-sm text-red-100 mt-1">Changes are saving locally but not to the server. You need to open access in Firebase Rules.</p>
               </div>
            </div>
            <button 
              onClick={() => setShowRulesModal(true)}
              className="bg-white text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors whitespace-nowrap"
            >
              Fix This Now
            </button>
          </div>
        </div>
      )}

      {/* Rules Fix Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl relative">
            <button onClick={() => setShowRulesModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-4">How to enable Cloud Saving</h3>
            <div className="space-y-4">
              <p className="text-gray-600">Your Firestore Database is currently in "Locked" or "Production" mode which blocks writes. Since we are using a custom admin panel, we need to allow writes.</p>
              
              <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">1. Go to Firebase Console &gt; Firestore Database &gt; Rules</p>
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">2. Paste this code exactly:</p>
                <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
                </pre>
              </div>
              
              <div className="flex gap-4">
                <a 
                  href="https://console.firebase.google.com/project/_/firestore/rules" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-600 text-white text-center py-3 rounded-lg font-bold hover:bg-blue-700"
                >
                  Open Firebase Console
                </a>
                <button 
                  onClick={() => { navigator.clipboard.writeText("rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if true;\n    }\n  }\n}"); alert("Rules copied to clipboard!"); }}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300"
                >
                  Copy Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-6 py-4 flex justify-between items-center shadow-lg sticky top-0 z-40">
        <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <span className="bg-blue-700 text-xs px-2 py-1 rounded-full text-blue-100 font-mono">PRO</span>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigateTo('home')} className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors shadow-sm border border-blue-600">View Site</button>
          <button onClick={logout} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition-colors shadow-sm border border-red-500">Logout</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <button onClick={() => setActiveTab('main')} className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 whitespace-nowrap ${activeTab === 'main' ? 'bg-blue-900 text-white shadow-lg scale-105' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Main Committee</button>
          <button onClick={() => setActiveTab('balavedhi')} className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 whitespace-nowrap ${activeTab === 'balavedhi' ? 'bg-blue-900 text-white shadow-lg scale-105' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Balavedhi</button>
          <button onClick={() => setActiveTab('gallery')} className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 whitespace-nowrap ${activeTab === 'gallery' ? 'bg-blue-900 text-white shadow-lg scale-105' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Gallery</button>
          <button onClick={() => setActiveTab('settings')} className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 whitespace-nowrap ${activeTab === 'settings' ? 'bg-blue-900 text-white shadow-lg scale-105' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Settings</button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 min-h-[500px]">
          {activeTab === 'main' && renderMemberEditor('main', data.mainCommittee)}
          {activeTab === 'balavedhi' && renderMemberEditor('balavedhi', data.balavedhiCommittee)}
          
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="text-xl font-bold text-blue-900">Event Gallery</h3>
                <button onClick={handleAddImage} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 shadow-md font-semibold flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  Add Image
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.galleryImages.map(img => (
                  <div key={img.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-col gap-4 hover:shadow-lg transition-all">
                    <div className="relative group w-full h-48 rounded-lg overflow-hidden bg-gray-200 border border-gray-300">
                       {uploadingId === img.id ? (
                         <div className="flex flex-col items-center justify-center h-full w-full text-gray-600 bg-gray-100">
                            <svg className="animate-spin h-6 w-6 mb-2 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span className="text-xs font-medium">Processing...</span>
                         </div>
                       ) : (
                         <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                       )}
                       <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white font-bold z-10">
                          <div className="flex flex-col items-center">
                            <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                            <span>Upload Photo</span>
                          </div>
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
                    <AutosaveInput 
                      value={img.alt} 
                      onSave={(val) => handleUpdateImage(img, 'alt', val)} 
                      placeholder="Event Description" 
                    />
                    <div className="flex justify-end mt-auto pt-2">
                         <button 
                          onClick={() => handleDeleteImage(img.id)} 
                          disabled={deletingId === img.id}
                          className={`text-sm px-3 py-1.5 rounded transition-colors font-medium ${
                             deletingId === img.id ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:bg-red-100'
                          }`}
                         >
                          {deletingId === img.id ? 'Deleting...' : 'Delete Image'}
                         </button>
                    </div>
                  </div>
                ))}
                 {data.galleryImages.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    No images in gallery.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
                 <h3 className="text-xl font-bold text-blue-900">Site Settings</h3>
              </div>

              {/* Logo Section */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Site Logo</h4>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-full md:w-1/3 flex flex-col items-center">
                    <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 relative group overflow-hidden">
                       {uploadingId === 'logo' ? (
                          <div className="flex flex-col items-center text-blue-600">
                            <svg className="animate-spin h-6 w-6 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span className="text-xs">Processing...</span>
                          </div>
                       ) : data.siteSettings.logo ? (
                          <img src={data.siteSettings.logo} alt="Site Logo" className="max-h-full max-w-full object-contain p-4" />
                       ) : (
                          <div className="text-gray-400 text-sm">No Logo Uploaded</div>
                       )}
                    </div>
                    {data.siteSettings.logo && (
                      <button onClick={handleRemoveLogo} className="mt-3 text-red-500 text-sm font-medium hover:text-red-700 hover:underline">Remove Logo</button>
                    )}
                  </div>
                  <div className="flex-1 w-full">
                     <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                       Upload a logo to appear in the website header and footer. It will replace the default text. 
                       <br/><strong>Recommended:</strong> PNG format with transparent background (approx 200x100px).
                     </p>
                     <label className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors font-medium shadow-sm">
                        Upload Logo
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          if (e.target.files?.[0]) handleLogoUpload(e.target.files[0]);
                        }} />
                     </label>
                  </div>
                </div>
              </div>

              {/* Favicon Section */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Site Favicon</h4>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-full md:w-1/3 flex flex-col items-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 relative group overflow-hidden">
                       {uploadingId === 'favicon' ? (
                          <div className="flex flex-col items-center text-blue-600">
                             <svg className="animate-spin h-5 w-5 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                             <span className="text-xs">Processing</span>
                          </div>
                       ) : data.siteSettings.favicon ? (
                          <img src={data.siteSettings.favicon} alt="Favicon" className="max-h-full max-w-full object-contain p-2" />
                       ) : (
                          <div className="text-gray-400 text-xs">No Favicon</div>
                       )}
                    </div>
                    {data.siteSettings.favicon && (
                      <button onClick={handleRemoveFavicon} className="mt-3 text-red-500 text-sm font-medium hover:text-red-700 hover:underline">Remove</button>
                    )}
                  </div>
                  <div className="flex-1 w-full">
                     <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                       Upload a browser icon (favicon).
                       <br/><strong>Recommended:</strong> Square PNG image (e.g., 192x192px).
                     </p>
                     <label className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors font-medium shadow-sm">
                        Upload Favicon
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          if (e.target.files?.[0]) handleFaviconUpload(e.target.files[0]);
                        }} />
                     </label>
                  </div>
                </div>
              </div>

              {/* Title Section */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Site Title</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wide">Application Name</label>
                    <input 
                      type="text" 
                      value={settingsTitle} 
                      onChange={(e) => setSettingsTitle(e.target.value)}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                    />
                    <p className="text-xs text-gray-500 mt-1">This is used for SEO and fallback text if no logo is present.</p>
                  </div>
                  <button 
                    onClick={handleSaveSettings} 
                    disabled={isSavingSettings}
                    className="bg-blue-800 text-white px-8 py-2.5 rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50 font-medium shadow-md"
                  >
                    {isSavingSettings ? 'Saving...' : 'Save Title'}
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


import React from 'react';
import { useApp } from '../../context/AppContext';
import Login from './Login';
import Dashboard from './Dashboard';
import { firebaseConfig } from '../../firebaseConfig';

const AdminPanel: React.FC = () => {
  const { isAuthenticated } = useApp();

  // --- CONFIGURATION VALIDATION ---
  const isConfigDefault = firebaseConfig.apiKey === "PASTE_API_KEY_HERE";
  const isConfigDuplicated = firebaseConfig.apiKey === firebaseConfig.projectId && firebaseConfig.apiKey.length > 20;

  if (isConfigDefault) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="max-w-lg bg-white p-8 rounded-xl shadow-xl border-l-4 border-red-500">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Setup Required</h2>
          <p className="text-gray-700 mb-4">
            You haven't configured the database yet.
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-gray-600 text-sm">
            <li>Open <code>firebaseConfig.ts</code></li>
            <li>Replace the placeholders with your actual Firebase keys</li>
          </ol>
        </div>
      </div>
    );
  }

  if (isConfigDuplicated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="max-w-lg bg-white p-8 rounded-xl shadow-xl border-l-4 border-red-500">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Configuration Error</h2>
          <p className="text-gray-700 mb-4">
            It looks like you pasted your <strong>API Key</strong> into every field.
          </p>
          <div className="bg-gray-100 p-4 rounded text-sm font-mono mb-4 break-all">
            Project ID: {firebaseConfig.projectId} <br/>
            (This looks like an API key, not a Project ID)
          </div>
          <p className="text-gray-600">
            Please go back to <code>firebaseConfig.ts</code> and copy the specific value for each field from the Firebase Console.
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <Dashboard />;
};

export default AdminPanel;

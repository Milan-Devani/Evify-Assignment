import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import VehicleList from './components/VehicleList';
import CreateAdmin from './components/CreateAdmin';
import './App.css';

const MainDashboard = () => {
  const { isAuthenticated, loading } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [page, setPage] = useState('dashboard'); // 'dashboard' | 'create-admin'

  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="spinner" />
        <p>Initializing Evify Fleet Management...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="app-layout">
      <Navbar
        onAddVehicleClick={() => setIsAddModalOpen(true)}
        onCreateAdminClick={() => setPage('create-admin')}
        activePage={page}
      />
      <main className="main-content">
        {page === 'create-admin' ? (
          <CreateAdmin onBack={() => setPage('dashboard')} />
        ) : (
          <>
            <div className="dashboard-header">
              <div>
                <h1 className="page-title">EV Fleet Management</h1>
                <p className="page-subtitle">
                  Real-time monitoring, telemetry, operational status, and maintenance logs.
                </p>
              </div>
            </div>

            <VehicleList
              isModalOpen={isAddModalOpen}
              setIsModalOpen={setIsAddModalOpen}
            />
          </>
        )}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <MainDashboard />
    </AuthProvider>
  );
};

export default App;


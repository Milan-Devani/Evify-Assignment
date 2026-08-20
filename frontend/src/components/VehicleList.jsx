import React, { useState, useEffect, useCallback } from 'react';
import vehicleService from '../services/vehicleService';
import fleetService from '../services/fleetService';
import BatteryIndicator from './BatteryIndicator';
import StatusBadge from './StatusBadge';
import VehicleModal from './VehicleModal';
import './VehicleList.css';

const VehicleList = ({ isModalOpen, setIsModalOpen }) => {
  const [vehicles, setVehicles] = useState([]);
  const [fleets, setFleets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filters & Pagination State
  const [selectedFleet, setSelectedFleet] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // Modal & Edit State
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  // Fetch Fleets once on mount
  useEffect(() => {
    const fetchFleets = async () => {
      try {
        const response = await fleetService.getAll();
        setFleets(response.data || []);
      } catch (err) {
        // Fleet loading failed
      }
    };
    fetchFleets();
  }, []);

  // Fetch Vehicles whenever filters or page change
  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit,
        ...(selectedFleet && { fleet: selectedFleet }),
        ...(selectedStatus && { status: selectedStatus }),
      };

      const response = await vehicleService.getAll(params);
      setVehicles(response.data || []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        'Failed to fetch vehicles from server.'
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, selectedFleet, selectedStatus]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleFleetFilter = (e) => {
    setSelectedFleet(e.target.value);
    setPage(1);
  };

  const handleStatusFilter = (e) => {
    setSelectedStatus(e.target.value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSelectedFleet('');
    setSelectedStatus('');
    setPage(1);
  };

  const handleOpenAddModal = () => {
    setEditingVehicle(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleSaveVehicle = async (formData) => {
    if (editingVehicle) {
      await vehicleService.update(editingVehicle._id, formData);
      showSuccess(`Vehicle ${formData.registrationNumber} updated successfully.`);
    } else {
      await vehicleService.create(formData);
      showSuccess(`Vehicle ${formData.registrationNumber} created successfully.`);
    }
    fetchVehicles();
  };

  const handleConfirmDelete = async () => {
    if (!vehicleToDelete) return;
    try {
      await vehicleService.delete(vehicleToDelete._id);
      showSuccess(`Vehicle ${vehicleToDelete.registrationNumber} deleted.`);
      setVehicleToDelete(null);
      fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete vehicle.');
      setVehicleToDelete(null);
    }
  };

  return (
    <div className="vehicle-list-container">
      {/* Notifications */}
      {successMessage && (
        <div className="alert alert-success">
          <span>✓ {successMessage}</span>
          <button onClick={() => setSuccessMessage('')}>&times;</button>
        </div>
      )}
      {error && (
        <div className="alert alert-danger">
          <span>⚠ {error}</span>
          <button onClick={() => setError('')}>&times;</button>
        </div>
      )}

      {/* Control Bar: Filters & Actions */}
      <div className="table-controls-card">
        <div className="filter-group">
          <div className="filter-item">
            <label>Filter by Fleet</label>
            <select value={selectedFleet} onChange={handleFleetFilter}>
              <option value="">All Fleets</option>
              {fleets.map((fleet) => (
                <option key={fleet._id} value={fleet._id}>
                  {fleet.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Filter by Status</label>
            <select value={selectedStatus} onChange={handleStatusFilter}>
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="charging">Charging</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {(selectedFleet || selectedStatus) && (
            <button className="btn-clear-filters" onClick={handleClearFilters}>
              Reset Filters
            </button>
          )}
        </div>

        <button className="btn-primary" onClick={handleOpenAddModal}>
          + Add Vehicle
        </button>
      </div>

      {/* Table Section */}
      <div className="table-wrapper-card">
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading fleet vehicles...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚗</div>
            <h3>No Vehicles Found</h3>
            <p>
              {selectedFleet || selectedStatus
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by creating your first electric vehicle.'}
            </p>
            <button className="btn-primary" onClick={handleOpenAddModal}>
              Add Vehicle
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="vehicle-table">
              <thead>
                <tr>
                  <th>Registration</th>
                  <th>Model</th>
                  <th>Status</th>
                  <th>Fleet</th>
                  <th>Battery Level</th>
                  <th>Last Maintenance</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v._id}>
                    <td className="font-semibold text-dark">
                      <code>{v.registrationNumber}</code>
                    </td>
                    <td>{v.model}</td>
                    <td>
                      <StatusBadge status={v.status} />
                    </td>
                    <td>
                      <span className="fleet-badge">
                        {v.fleet?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td>
                      <BatteryIndicator level={v.batteryLevel} />
                    </td>
                    <td className="text-muted">
                      {v.lastMaintenance
                        ? new Date(v.lastMaintenance).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="actions-cell">
                      <button
                        className="btn-action btn-edit"
                        onClick={() => handleOpenEditModal(v)}
                        title="Edit Vehicle"
                      >
                        Edit
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => setVehicleToDelete(v)}
                        title="Delete Vehicle"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && pagination.pages > 1 && (
          <div className="pagination-bar">
            <div className="pagination-info">
              Showing page <strong>{pagination.page}</strong> of{' '}
              <strong>{pagination.pages}</strong> ({pagination.total} total vehicles)
            </div>
            <div className="pagination-buttons">
              <button
                className="btn-page"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                &larr; Previous
              </button>
              <span className="current-page-badge">{page}</span>
              <button
                className="btn-page"
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              >
                Next &rarr;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Vehicle Modal */}
      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveVehicle}
        vehicle={editingVehicle}
        fleets={fleets}
      />

      {/* Delete Confirmation Dialog */}
      {vehicleToDelete && (
        <div className="modal-overlay" onClick={() => setVehicleToDelete(null)}>
          <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Vehicle Deletion</h3>
            <p>
              Are you sure you want to permanently delete vehicle{' '}
              <strong>{vehicleToDelete.registrationNumber}</strong> (
              {vehicleToDelete.model})?
            </p>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setVehicleToDelete(null)}
              >
                Cancel
              </button>
              <button
                className="btn-delete-confirm"
                onClick={handleConfirmDelete}
              >
                Delete Vehicle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleList;

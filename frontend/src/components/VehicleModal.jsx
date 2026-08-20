import React, { useState, useEffect } from 'react';

const VehicleModal = ({ isOpen, onClose, onSave, vehicle, fleets }) => {
  const isEditing = !!vehicle;

  const [formData, setFormData] = useState({
    registrationNumber: '',
    model: '',
    status: 'active',
    fleet: '',
    batteryLevel: 100,
    notes: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        registrationNumber: vehicle.registrationNumber || '',
        model: vehicle.model || '',
        status: vehicle.status || 'active',
        fleet: typeof vehicle.fleet === 'object' ? vehicle.fleet?._id : vehicle.fleet || '',
        batteryLevel: vehicle.batteryLevel !== undefined ? vehicle.batteryLevel : 100,
        notes: vehicle.notes || '',
      });
    } else {
      setFormData({
        registrationNumber: '',
        model: '',
        status: 'active',
        fleet: fleets.length > 0 ? fleets[0]._id : '',
        batteryLevel: 100,
        notes: '',
      });
    }
    setFormError('');
  }, [vehicle, fleets, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'batteryLevel' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Form validations
    const regUpper = formData.registrationNumber.trim().toUpperCase();
    if (!/^[A-Z0-9-]+$/.test(regUpper)) {
      setFormError('Registration number must contain only letters, numbers, and dashes.');
      return;
    }
    if (!formData.model.trim()) {
      setFormError('Model is required.');
      return;
    }
    if (!formData.fleet) {
      setFormError('Please select a fleet.');
      return;
    }
    if (formData.batteryLevel < 0 || formData.batteryLevel > 100) {
      setFormError('Battery level must be between 0 and 100.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        registrationNumber: regUpper,
      });
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        (err.response?.data?.errors && err.response.data.errors.map((e) => e.message).join(', ')) ||
        err.message ||
        'Failed to save vehicle.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
          <button className="btn-close-modal" onClick={onClose}>
            &times;
          </button>
        </div>

        {formError && <div className="modal-error-alert">{formError}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-form-grid">
            <div className="form-group">
              <label>Registration Number *</label>
              <input
                type="text"
                name="registrationNumber"
                placeholder="e.g. EV-DOWNTOWN-01"
                value={formData.registrationNumber}
                onChange={handleChange}
                required
                maxLength={20}
                autoFocus={!isEditing}
              />
              <small className="help-text">Letters, numbers, and dashes only</small>
            </div>

            <div className="form-group">
              <label>Vehicle Model *</label>
              <input
                type="text"
                name="model"
                placeholder="e.g. Tesla Model 3"
                value={formData.model}
                onChange={handleChange}
                required
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label>Assigned Fleet *</label>
              <select name="fleet" value={formData.fleet} onChange={handleChange} required>
                <option value="" disabled>
                  Select a fleet
                </option>
                {fleets.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Operational Status *</label>
              <select name="status" value={formData.status} onChange={handleChange} required>
                <option value="active">Active</option>
                <option value="charging">Charging</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="form-group">
              <label>Battery Level ({formData.batteryLevel}%)</label>
              <input
                type="range"
                name="batteryLevel"
                min="0"
                max="100"
                value={formData.batteryLevel}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label>Notes & Maintenance Log</label>
            <textarea
              name="notes"
              placeholder="Optional operational details, charger location, or maintenance remarks..."
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Vehicle' : 'Create Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleModal;

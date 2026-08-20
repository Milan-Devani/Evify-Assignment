import React, { useState } from 'react';
import adminService from '../services/adminService';
import './CreateAdmin.css';

const ROLES = [
  { value: '', label: 'Select a role...' },
  { value: 'admin', label: 'Admin — Full access' },
  { value: 'manager', label: 'Manager — Fleet management' },
  { value: 'operator', label: 'Operator — Vehicle operations' },
  { value: 'viewer', label: 'Viewer — Read only' },
];

const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: '',
  address: '',
};

/* ─── Inline client-side validation (mirrors backend rules) ─────────────── */
const validate = (fields) => {
  const errors = {};

  if (!fields.firstName.trim()) {
    errors.firstName = 'First name is required.';
  } else if (fields.firstName.trim().length < 2) {
    errors.firstName = 'First name must be at least 2 characters.';
  }

  if (!fields.lastName.trim()) {
    errors.lastName = 'Last name is required.';
  } else if (fields.lastName.trim().length < 2) {
    errors.lastName = 'Last name must be at least 2 characters.';
  }

  if (!fields.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!fields.phone.trim()) {
    errors.phone = 'Phone number is required.';
  } else if (!/^\+?[0-9]{10,15}$/.test(fields.phone.trim())) {
    errors.phone = 'Enter a valid phone number (10–15 digits, optional +).';
  }

  if (!fields.password) {
    errors.password = 'Password is required.';
  } else if (fields.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  } else if (!/[A-Z]/.test(fields.password)) {
    errors.password = 'Password must contain at least one uppercase letter.';
  } else if (!/[0-9]/.test(fields.password)) {
    errors.password = 'Password must contain at least one number.';
  }

  if (!fields.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (fields.password && fields.confirmPassword !== fields.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (!fields.role) {
    errors.role = 'Please select a role.';
  }

  if (!fields.address.trim()) {
    errors.address = 'Address is required.';
  } else if (fields.address.trim().length < 5) {
    errors.address = 'Address must be at least 5 characters.';
  }

  return errors;
};

/* ─── Component ──────────────────────────────────────────────────────────── */
const CreateAdmin = ({ onBack }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* Live validation: clear field error as user corrects it */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    setServerError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setServerError('');

    // Client-side validation first
    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const data = await adminService.createAdmin(form);
      setSuccessMsg(
        `✅ Admin "${data.admin.name}" created successfully with role "${data.admin.role}".`
      );
      setForm(INITIAL_FORM);
      setFieldErrors({});
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to create admin. Please try again.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setFieldErrors({});
    setServerError('');
    setSuccessMsg('');
  };

  return (
    <div className="create-admin-page">
      {/* ── Page Header ── */}
      <div className="ca-page-header">
        <button className="ca-back-btn" onClick={onBack} type="button">
          ← Back to Dashboard
        </button>
        <div className="ca-header-text">
          <h1 className="ca-page-title">Create Admin</h1>
          <p className="ca-page-subtitle">
            Add a new administrator to the Evify Fleet Management system.
          </p>
        </div>
      </div>

      {/* ── Card ── */}
      <div className="ca-card">
        <div className="ca-card-header">
          <div className="ca-card-icon">👤</div>
          <div>
            <h2 className="ca-card-title">New Admin Details</h2>
            <p className="ca-card-desc">Fill in all fields. All information is required.</p>
          </div>
        </div>

        {/* Global alerts */}
        {serverError && (
          <div className="ca-alert ca-alert-error" role="alert">
            <span className="ca-alert-icon">⚠️</span>
            {serverError}
          </div>
        )}
        {successMsg && (
          <div className="ca-alert ca-alert-success" role="alert">
            <span className="ca-alert-icon">✅</span>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="ca-form">
          {/* ── Row 1: First / Last Name ── */}
          <div className="ca-row">
            <div className={`ca-field ${fieldErrors.firstName ? 'ca-field-error' : ''}`}>
              <label htmlFor="ca-firstName">First Name <span className="ca-req">*</span></label>
              <input
                id="ca-firstName"
                name="firstName"
                type="text"
                placeholder="e.g. John"
                value={form.firstName}
                onChange={handleChange}
                disabled={loading}
                autoComplete="given-name"
              />
              {fieldErrors.firstName && (
                <span className="ca-error-msg">{fieldErrors.firstName}</span>
              )}
            </div>

            <div className={`ca-field ${fieldErrors.lastName ? 'ca-field-error' : ''}`}>
              <label htmlFor="ca-lastName">Last Name <span className="ca-req">*</span></label>
              <input
                id="ca-lastName"
                name="lastName"
                type="text"
                placeholder="e.g. Doe"
                value={form.lastName}
                onChange={handleChange}
                disabled={loading}
                autoComplete="family-name"
              />
              {fieldErrors.lastName && (
                <span className="ca-error-msg">{fieldErrors.lastName}</span>
              )}
            </div>
          </div>

          {/* ── Row 2: Email (full width) ── */}
          <div className={`ca-field ca-field-full ${fieldErrors.email ? 'ca-field-error' : ''}`}>
            <label htmlFor="ca-email">Email Address <span className="ca-req">*</span></label>
            <input
              id="ca-email"
              name="email"
              type="email"
              placeholder="e.g. john.doe@evify.com"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
              autoComplete="email"
            />
            {fieldErrors.email && (
              <span className="ca-error-msg">{fieldErrors.email}</span>
            )}
          </div>

          {/* ── Row 3: Phone / Role ── */}
          <div className="ca-row">
            <div className={`ca-field ${fieldErrors.phone ? 'ca-field-error' : ''}`}>
              <label htmlFor="ca-phone">Phone Number <span className="ca-req">*</span></label>
              <input
                id="ca-phone"
                name="phone"
                type="tel"
                placeholder="e.g. +919876543210"
                value={form.phone}
                onChange={handleChange}
                disabled={loading}
                autoComplete="tel"
              />
              {fieldErrors.phone && (
                <span className="ca-error-msg">{fieldErrors.phone}</span>
              )}
            </div>

            <div className={`ca-field ${fieldErrors.role ? 'ca-field-error' : ''}`}>
              <label htmlFor="ca-role">Bot / Role <span className="ca-req">*</span></label>
              <select
                id="ca-role"
                name="role"
                value={form.role}
                onChange={handleChange}
                disabled={loading}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value} disabled={r.value === ''}>
                    {r.label}
                  </option>
                ))}
              </select>
              {fieldErrors.role && (
                <span className="ca-error-msg">{fieldErrors.role}</span>
              )}
            </div>
          </div>

          {/* ── Row 3: Password / Confirm Password ── */}
          <div className="ca-row">
            <div className={`ca-field ${fieldErrors.password ? 'ca-field-error' : ''}`}>
              <label htmlFor="ca-password">Password <span className="ca-req">*</span></label>
              <div className="ca-input-wrap">
                <input
                  id="ca-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="ca-toggle-visibility"
                  onClick={() => setShowPassword((p) => !p)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {fieldErrors.password && (
                <span className="ca-error-msg">{fieldErrors.password}</span>
              )}
            </div>

            <div className={`ca-field ${fieldErrors.confirmPassword ? 'ca-field-error' : ''}`}>
              <label htmlFor="ca-confirmPassword">
                Confirm Password <span className="ca-req">*</span>
              </label>
              <div className="ca-input-wrap">
                <input
                  id="ca-confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="ca-toggle-visibility"
                  onClick={() => setShowConfirm((p) => !p)}
                  tabIndex={-1}
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <span className="ca-error-msg">{fieldErrors.confirmPassword}</span>
              )}
            </div>
          </div>

          {/* ── Address ── */}
          <div className={`ca-field ca-field-full ${fieldErrors.address ? 'ca-field-error' : ''}`}>
            <label htmlFor="ca-address">Address <span className="ca-req">*</span></label>
            <textarea
              id="ca-address"
              name="address"
              rows={3}
              placeholder="e.g. 123 Main Street, Mumbai, Maharashtra 400001"
              value={form.address}
              onChange={handleChange}
              disabled={loading}
              autoComplete="street-address"
            />
            {fieldErrors.address && (
              <span className="ca-error-msg">{fieldErrors.address}</span>
            )}
          </div>

          {/* ── Password strength hint ── */}
          <div className="ca-password-hint">
            <span>Password requirements:</span>
            <ul>
              <li className={form.password.length >= 8 ? 'ca-hint-ok' : ''}>
                At least 8 characters
              </li>
              <li className={/[A-Z]/.test(form.password) ? 'ca-hint-ok' : ''}>
                One uppercase letter
              </li>
              <li className={/[0-9]/.test(form.password) ? 'ca-hint-ok' : ''}>
                One number
              </li>
              <li
                className={
                  form.confirmPassword && form.confirmPassword === form.password
                    ? 'ca-hint-ok'
                    : ''
                }
              >
                Passwords match
              </li>
            </ul>
          </div>

          {/* ── Actions ── */}
          <div className="ca-actions">
            <button
              type="button"
              className="ca-btn ca-btn-secondary"
              onClick={handleReset}
              disabled={loading}
            >
              Reset Form
            </button>
            <button type="submit" className="ca-btn ca-btn-primary" disabled={loading}>
              {loading ? (
                <span className="ca-spinner-wrap">
                  <span className="ca-spinner" /> Creating Admin...
                </span>
              ) : (
                'Create Admin'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAdmin;

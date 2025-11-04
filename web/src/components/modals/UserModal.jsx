import { useState, useEffect } from 'react';
import { UserPlus, Shield, Mail, Calendar, Lock } from 'lucide-react';
import ModalRoot from '../ModalRoot.jsx';
import FormField from '../FormField.jsx';
import { useApp } from '../../context/AppContext.jsx';

const PERMISSION_GROUPS = {
  inventory: ['View', 'Create', 'Edit', 'Adjust', 'Move', 'Delete'],
  procurement: ['View', 'Create PO', 'Approve PO', 'Receive/GRN'],
  reports: ['View', 'Export'],
  manage: ['Users', 'Roles', 'Sites/Teams', 'Permissions'],
  labels: ['View', 'Print', 'Generate'],
};

export default function UserModal({ open, onClose, onSave, roles = [], sites = [], teams = [], onCreateRole, pendingRoleSelect }) {
  const { toast } = useApp();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    jobTitle: '',
    phone: '',
    roleId: '',
    siteIds: [],
    teamIds: [],
    defaultSiteId: '',
    status: 'active',
    sendEmailInvite: true,
    setTempPassword: false,
    tempPassword: '',
    requireMfa: true,
    accessExpiry: '',
    notes: '',
  });

  // Reset form when modal opens, or update roleId when pendingRoleSelect changes
  useEffect(() => {
    if (open) {
      setFormData(prev => ({
        firstName: '',
        lastName: '',
        email: '',
        jobTitle: '',
        phone: '',
        roleId: pendingRoleSelect || prev.roleId || '',
        siteIds: [],
        teamIds: [],
        defaultSiteId: '',
        status: 'active',
        sendEmailInvite: true,
        setTempPassword: false,
        tempPassword: '',
        requireMfa: true,
        accessExpiry: '',
        notes: '',
      }));
      setErrors({});
    }
  }, [open]);

  // Update roleId when pendingRoleSelect changes while modal is open
  useEffect(() => {
    if (open && pendingRoleSelect) {
      setFormData(prev => ({ ...prev, roleId: pendingRoleSelect }));
    }
  }, [pendingRoleSelect, open]);

  function validate() {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.roleId) newErrors.roleId = 'Role is required';
    if (formData.siteIds.length > 0 && !formData.defaultSiteId) {
      newErrors.defaultSiteId = 'Default site is required when sites are selected';
    }
    if (formData.setTempPassword && formData.tempPassword.length < 8) {
      newErrors.tempPassword = 'Password must be at least 8 characters';
    }
    if (formData.accessExpiry && new Date(formData.accessExpiry) < new Date()) {
      newErrors.accessExpiry = 'Access expiry must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        jobTitle: formData.jobTitle.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        roleId: formData.roleId,
        siteIds: formData.siteIds,
        teamIds: formData.teamIds.length > 0 ? formData.teamIds : undefined,
        defaultSiteId: formData.siteIds.length > 0 ? formData.defaultSiteId : undefined,
        status: formData.status,
        invite: formData.sendEmailInvite 
          ? { sendEmail: true }
          : { tempPassword: formData.tempPassword },
        security: {
          requireMfa: formData.requireMfa,
          accessExpiry: formData.accessExpiry || undefined,
        },
        notes: formData.notes.trim() || undefined,
      };

      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (onSave) {
        onSave(payload);
      }
      
      toast('User invited successfully');
      onClose();
    } catch (err) {
      if (err.status === 409) {
        setErrors({ email: 'Email already exists' });
      } else {
        toast('Failed to create user: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  }

  const selectedRole = roles.find(r => r.id === formData.roleId || r.name === formData.roleId);

  return (
    <ModalRoot open={open} onClose={onClose} title="Add New User" maxWidth="max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="First name" required htmlFor="firstName" error={errors.firstName}>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className="input w-full"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Last name" required htmlFor="lastName" error={errors.lastName}>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className="input w-full"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Email" required htmlFor="email" error={errors.email}>
              <input
                id="email"
                name="email"
                type="email"
                className="input w-full"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                required
              />
            </FormField>

            <FormField label="Job title" htmlFor="jobTitle">
              <input
                id="jobTitle"
                name="jobTitle"
                type="text"
                className="input w-full"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              />
            </FormField>

            <FormField label="Phone" htmlFor="phone" hint="E.164 format (e.g., +44 20 1234 5678)">
              <input
                id="phone"
                name="phone"
                type="tel"
                className="input w-full"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </FormField>
          </div>
        </div>

        {/* Role & Access */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-4">Role & Access</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Role" required htmlFor="roleId" error={errors.roleId}>
              <div className="flex gap-2">
                <select
                  id="roleId"
                  name="roleId"
                  className="input w-full flex-1"
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  required
                >
                  <option value="">Select role...</option>
                  {roles.map((role) => (
                    <option key={role.id || role.name} value={role.id || role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
                {onCreateRole && (
                  <button
                    type="button"
                    className="btn-secondary text-xs"
                    onClick={() => onCreateRole()}
                  >
                    Create new role
                  </button>
                )}
              </div>
            </FormField>

            <FormField label="Status" required htmlFor="status">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={formData.status === 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="text-primary"
                  />
                  <span className="text-sm text-primary">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="disabled"
                    checked={formData.status === 'disabled'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="text-primary"
                  />
                  <span className="text-sm text-primary">Disabled</span>
                </label>
              </div>
            </FormField>

            <FormField label="Sites" htmlFor="sites">
              <select
                id="sites"
                name="sites"
                multiple
                className="input w-full min-h-[100px]"
                value={formData.siteIds}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                  setFormData({ 
                    ...formData, 
                    siteIds: selected,
                    defaultSiteId: selected.includes(formData.defaultSiteId) ? formData.defaultSiteId : (selected[0] || '')
                  });
                }}
              >
                {sites.map((site) => (
                  <option key={site.code || site.id} value={site.code || site.id}>
                    {site.name || site.code} ({site.code || site.id})
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted mt-1">Hold Ctrl/Cmd to select multiple</p>
            </FormField>

            <FormField label="Default site" htmlFor="defaultSiteId" error={errors.defaultSiteId} 
              hint={formData.siteIds.length === 0 ? 'Select sites first' : undefined}>
              <select
                id="defaultSiteId"
                name="defaultSiteId"
                className="input w-full"
                value={formData.defaultSiteId}
                onChange={(e) => setFormData({ ...formData, defaultSiteId: e.target.value })}
                disabled={formData.siteIds.length === 0}
              >
                <option value="">Select default site...</option>
                {sites.filter(s => formData.siteIds.includes(s.code || s.id)).map((site) => (
                  <option key={site.code || site.id} value={site.code || site.id}>
                    {site.name || site.code}
                  </option>
                ))}
              </select>
            </FormField>

            {teams.length > 0 && (
              <FormField label="Teams (optional)" htmlFor="teams">
                <select
                  id="teams"
                  name="teams"
                  multiple
                  className="input w-full min-h-[80px]"
                  value={formData.teamIds}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                    setFormData({ ...formData, teamIds: selected });
                  }}
                >
                  {teams.map((team) => (
                    <option key={team.id || team.name} value={team.id || team.name}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </FormField>
            )}
          </div>
        </div>

        {/* Permissions Preview */}
        {selectedRole && (
          <div className="bg-elevated rounded-lg p-4 border border-base">
            <h4 className="text-sm font-medium text-primary mb-2">Permissions Preview</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PERMISSION_GROUPS).map(([group, perms]) => (
                perms.map(perm => (
                  <span key={`${group}-${perm}`} className="px-2 py-1 bg-panel border border-base rounded text-xs text-secondary">
                    {group}: {perm}
                  </span>
                ))
              ))}
            </div>
            <button type="button" className="text-xs text-secondary mt-2 hover:text-primary underline">
              View role permissions
            </button>
          </div>
        )}

        {/* Authentication */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-4">Authentication</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.sendEmailInvite}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  sendEmailInvite: e.target.checked,
                  setTempPassword: !e.target.checked ? false : formData.setTempPassword
                })}
                className="rounded border-base"
              />
              <div className="flex-1">
                <span className="text-sm text-primary">Send email invite</span>
                <p className="text-xs text-muted">Sends an email with a secure sign-in link.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.setTempPassword}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  setTempPassword: e.target.checked,
                  sendEmailInvite: !e.target.checked ? true : formData.sendEmailInvite
                })}
                className="rounded border-base"
              />
              <span className="text-sm text-primary">Set temporary password</span>
            </label>

            {formData.setTempPassword && (
              <FormField label="Temporary password" required htmlFor="tempPassword" error={errors.tempPassword}>
                <input
                  id="tempPassword"
                  name="tempPassword"
                  type="password"
                  className="input w-full"
                  value={formData.tempPassword}
                  onChange={(e) => setFormData({ ...formData, tempPassword: e.target.value })}
                  minLength={8}
                  required={formData.setTempPassword}
                />
              </FormField>
            )}
          </div>
        </div>

        {/* Security */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-4">Security</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requireMfa}
                onChange={(e) => setFormData({ ...formData, requireMfa: e.target.checked })}
                className="rounded border-base"
              />
              <span className="text-sm text-primary">Require MFA at first login</span>
            </label>

            <FormField label="Access expiry (optional)" htmlFor="accessExpiry" error={errors.accessExpiry}
              hint="For contractors - access will be disabled after this date">
              <input
                id="accessExpiry"
                name="accessExpiry"
                type="date"
                className="input w-full"
                value={formData.accessExpiry}
                onChange={(e) => setFormData({ ...formData, accessExpiry: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </FormField>
          </div>
        </div>

        {/* Notes */}
        <FormField label="Notes (optional)" htmlFor="notes">
          <textarea
            id="notes"
            name="notes"
            className="input w-full min-h-[80px] resize-y"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Internal notes about this user..."
          />
        </FormField>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-base">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </ModalRoot>
  );
}


import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import ModalRoot from '../ModalRoot.jsx';
import FormField from '../FormField.jsx';
import { useApp } from '../../context/AppContext.jsx';

const PERMISSION_GROUPS = {
  inventory: { label: 'Inventory', permissions: ['View', 'Create', 'Edit', 'Adjust', 'Move', 'Delete'] },
  procurement: { label: 'Procurement', permissions: ['View', 'Create PO', 'Approve PO', 'Receive/GRN'] },
  reports: { label: 'Reports', permissions: ['View', 'Export'] },
  manage: { label: 'Manage', permissions: ['Users', 'Roles', 'Sites/Teams', 'Permissions'] },
  labels: { label: 'Labels & QR', permissions: ['View', 'Print', 'Generate'] },
};

export default function RoleModal({ open, onClose, onSave, existingRoles = [] }) {
  const { toast } = useApp();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: {},
    isDefault: false,
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        description: '',
        permissions: {},
        isDefault: false,
      });
      setErrors({});
    }
  }, [open]);

  function validate() {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    } else if (existingRoles.some(r => (r.name || r.id) === formData.name.trim())) {
      newErrors.name = 'Role name already exists';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function togglePermission(group, permission) {
    const key = `${group}.${permission}`;
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [key]: !formData.permissions[key],
      },
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        permissions: formData.permissions,
        isDefault: formData.isDefault || undefined,
      };

      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (onSave) {
        onSave(payload);
      }
      
      toast('Role created successfully');
      onClose();
    } catch (err) {
      toast('Failed to create role: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalRoot open={open} onClose={onClose} title="Add New Role" maxWidth="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Role name" required htmlFor="roleName" error={errors.name}>
              <input
                id="roleName"
                name="roleName"
                type="text"
                className="input w-full"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Manager, Supervisor"
                required
              />
            </FormField>

            <FormField label="Default for new users" htmlFor="isDefault">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded border-base"
                />
                <span className="text-sm text-primary">Set as default role for new users</span>
              </label>
            </FormField>

            <div className="md:col-span-2">
              <FormField label="Description (optional)" htmlFor="description">
                <textarea
                  id="description"
                  name="description"
                  className="input w-full min-h-[80px] resize-y"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this role's purpose..."
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* Permissions Matrix */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-4">Permissions Matrix</h3>
          <div className="space-y-4">
            {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => (
              <div key={groupKey} className="border border-base rounded-lg p-4 bg-elevated">
                <h4 className="text-sm font-medium text-primary mb-3">{group.label}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {group.permissions.map((perm) => {
                    const key = `${groupKey}.${perm}`;
                    const isChecked = formData.permissions[key] || false;
                    return (
                      <label
                        key={perm}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(groupKey, perm)}
                          className="rounded border-base"
                        />
                        <span className="text-sm text-primary">{perm}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

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


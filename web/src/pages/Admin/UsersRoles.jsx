import { useEffect, useMemo, useState } from 'react';
import { users as seedUsers, sites as siteList } from '../../data/mockAdmin.js';
import { exportToCSV } from '../../utils/csvUtils.js';
import Guard from '../../components/Guard.jsx';
import ViewDrawer from '../../components/ViewDrawer.jsx';
import EditModal from '../../components/EditModal.jsx';
import TableCard from '../../components/TableCard.jsx';
import SplitButton from '../../components/SplitButton.jsx';
import UserModal from '../../components/modals/UserModal.jsx';
import RoleModal from '../../components/modals/RoleModal.jsx';
import { UserPlus, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';

const ROLE_COLORS = {
  Admin: 'bg-indigo-500/20 text-indigo-300 border-indigo-600/40',
  Manager: 'bg-emerald-500/20 text-emerald-300 border-emerald-600/40',
  Supervisor: 'bg-amber-500/20 text-amber-300 border-amber-600/40',
  Fitter: 'bg-sky-500/20 text-sky-300 border-sky-600/40',
  Viewer: 'bg-zinc-500/20 text-zinc-300 border-zinc-600/40',
};

export default function UsersRoles() {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [rows, setRows] = useState(seedUsers);
  const [viewRow, setViewRow] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roles, setRoles] = useState(['Admin','Manager','Supervisor','Fitter','Viewer'].map((name, idx) => ({ id: name, name })));
  const [pendingRoleSelect, setPendingRoleSelect] = useState(null);
  const currentRole = useAuthStore((s) => s.currentUser.role);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'n' || e.key === 'N') setUserModalOpen(true);
      if (e.key === 'e' || e.key === 'E') handleExport();
      if (e.key === '/') { e.preventDefault(); const el = document.getElementById('users-search'); el?.focus(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((u) => {
      const q = query.toLowerCase();
      const matchesQuery = !q || [u.name, u.email, u.role, ...(u.sites||[])].join(' ').toLowerCase().includes(q);
      const matchesRole = !roleFilter || u.role === roleFilter;
      const matchesSite = !siteFilter || (u.sites||[]).includes(siteFilter);
      return matchesQuery && matchesRole && matchesSite;
    });
  }, [rows, query, roleFilter, siteFilter]);

  function handleExport() {
    const headers = ['name','email','role','sites','status','lastLogin'];
    const data = filtered.map((u) => ({
      name: u.name,
      email: u.email,
      role: u.role,
      sites: (u.sites||[]).join('|'),
      status: u.status,
      lastLogin: u.lastLogin,
    }));
    exportToCSV('users.csv', headers, data);
  }

  function toggleStatus(u) {
    setRows((rs) => rs.map((r) => (r.id === u.id ? { ...r, status: r.status === 'Active' ? 'Disabled' : 'Active' } : r)));
  }

  function onUserSave(payload) {
    const next = {
      id: `U-${Math.floor(1000 + Math.random()*9000)}`,
      name: `${payload.firstName} ${payload.lastName}`,
      email: payload.email,
      role: roles.find(r => (r.id || r.name) === payload.roleId)?.name || payload.roleId,
      sites: payload.siteIds || [],
      status: payload.status === 'active' ? 'Active' : 'Disabled',
      lastLogin: '—',
    };
    setRows((r) => [next, ...r]);
    setUserModalOpen(false);
  }

  function onRoleSave(payload) {
    const newRole = {
      id: payload.name,
      name: payload.name,
      description: payload.description,
      permissions: payload.permissions,
      isDefault: payload.isDefault,
    };
    setRoles((r) => [...r, newRole]);
    setRoleModalOpen(false);
    
    // If this was opened from User modal, auto-select it and reopen user modal
    if (pendingRoleSelect === 'pending') {
      const roleId = newRole.id || newRole.name;
      setPendingRoleSelect(roleId);
      setUserModalOpen(true);
    } else {
      setPendingRoleSelect(null);
    }
  }

  function handleCreateRoleFromUser() {
    setUserModalOpen(false);
    setPendingRoleSelect('pending'); // Mark that we're creating a role from user modal
    setRoleModalOpen(true);
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (u) => (
      <span className={`inline-flex items-center gap-2 px-2 py-1 rounded border text-xs ${ROLE_COLORS[u.role] || ROLE_COLORS.Viewer}`}>{u.role}</span>
    ) },
    { key: 'sites', label: 'Sites', render: (u) => (u.sites||[]).map(s => <span key={s} className="inline-block text-xs px-2 py-0.5 rounded bg-elevated text-primary mr-1">{s}</span>) },
    { key: 'status', label: 'Status', render: (u) => (
      <span className={`text-xs px-2 py-0.5 rounded ${u.status==='Active'?'badge-success':'badge-danger'}`}>{u.status}</span>
    ) },
    { key: 'lastLogin', label: 'Last Login' },
    { key: 'actions', label: 'Actions', render: (u) => (
      <div className="flex gap-2">
        <button className="btn btn-xs" onClick={() => setViewRow(u)}>View</button>
        <Guard perm="ADMIN_USER" mode="disable">
          <button className="btn btn-xs" onClick={() => setEditRow(u)} title={currentRole==='Viewer'?"No permission":undefined}>Edit</button>
          <button className="btn btn-xs" onClick={() => toggleStatus(u)} title={currentRole==='Viewer'?"No permission":undefined}>
            {u.status==='Active'?'Disable':'Enable'}
          </button>
        </Guard>
      </div>
    ) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-semibold mr-auto">Users & Roles</h1>
        <input id="users-search" className="input" placeholder="Search… ( / )" value={query} onChange={(e)=>setQuery(e.target.value)} />
        <select className="input" value={roleFilter} onChange={(e)=>setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          {['Admin','Manager','Supervisor','Fitter','Viewer'].map(r=> <option key={r} value={r}>{r}</option>)}
        </select>
        <select className="input" value={siteFilter} onChange={(e)=>setSiteFilter(e.target.value)}>
          <option value="">All Sites</option>
          {(siteList||[]).map(s=> <option key={s.code} value={s.code}>{s.code}</option>)}
        </select>
        <Guard perm="ADMIN_USER" mode="disable">
          <SplitButton
            primaryAction={{
              label: 'New',
              icon: UserPlus,
              onClick: () => setUserModalOpen(true),
            }}
            menuItems={[
              {
                label: 'Add New User',
                icon: UserPlus,
                onClick: () => setUserModalOpen(true),
              },
              {
                label: 'Add New Role',
                icon: Shield,
                onClick: () => setRoleModalOpen(true),
              },
            ]}
            disabled={currentRole === 'Viewer'}
          />
        </Guard>
        <button className="btn" onClick={handleExport}>Export CSV (E)</button>
      </div>

      <TableCard title={`${filtered.length} Users`} columns={columns} rows={filtered} />

      {viewRow && (
        <ViewDrawer title="User" onClose={()=>setViewRow(null)}>
          <div className="space-y-2 text-sm">
            <div><span className="text-secondary">Name:</span> <span className="text-primary">{viewRow.name}</span></div>
            <div><span className="text-secondary">Email:</span> <span className="text-primary">{viewRow.email}</span></div>
            <div><span className="text-secondary">Role:</span> <span className="text-primary">{viewRow.role}</span></div>
            <div><span className="text-secondary">Sites:</span> <span className="text-primary">{(viewRow.sites||[]).join(', ')}</span></div>
            <div><span className="text-secondary">Status:</span> <span className="text-primary">{viewRow.status}</span></div>
            <div><span className="text-secondary">Last Login:</span> <span className="text-primary">{viewRow.lastLogin}</span></div>
          </div>
        </ViewDrawer>
      )}

      {editRow && (
        <EditModal title={`Edit ${editRow.email}`} onClose={()=>setEditRow(null)} onSave={(vals)=>{
          setRows((rs)=> rs.map(r=> r.id===editRow.id ? { ...r, role: vals.role, sites: vals.sites } : r));
          setEditRow(null);
        }}>
          <form className="space-y-3" onSubmit={(e)=>e.preventDefault()}>
            <div className="space-y-1">
              <label className="text-sm">Role</label>
              <select className="input" defaultValue={editRow.role} name="role">
                {['Admin','Manager','Supervisor','Fitter','Viewer'].map(r=> <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm">Sites</label>
              <select multiple className="input min-h-[120px]" defaultValue={editRow.sites} name="sites">
                {(siteList||[]).map(s=> <option key={s.code} value={s.code}>{s.code}</option>)}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" className="btn" onClick={()=>setEditRow(null)}>Cancel</button>
              <button type="submit" className="btn" onClick={(e)=>{
                const form = e.currentTarget.closest('form');
                const role = form.role.value;
                const sites = Array.from(form.sites.selectedOptions).map(o=>o.value);
                form?.dispatchEvent(new Event('save', { bubbles:true }));
                // call onSave via parent props through EditModal wrapper
              }}>Save</button>
            </div>
          </form>
        </EditModal>
      )}

      <UserModal
        open={userModalOpen}
        onClose={() => {
          setUserModalOpen(false);
          setPendingRoleSelect(null);
        }}
        onSave={onUserSave}
        roles={roles}
        sites={siteList || []}
        teams={[]}
        onCreateRole={handleCreateRoleFromUser}
        pendingRoleSelect={pendingRoleSelect}
      />

      <RoleModal
        open={roleModalOpen}
        onClose={() => {
          setRoleModalOpen(false);
          if (pendingRoleSelect === 'pending') {
            setPendingRoleSelect(null);
          }
        }}
        onSave={onRoleSave}
        existingRoles={roles}
      />
    </div>
  );
}


import { useEffect, useMemo, useState } from 'react';
import { users as seedUsers, sites as siteList } from '../../data/mockAdmin.js';
import { exportToCSV } from '../../utils/csvUtils.js';
import Guard from '../../components/Guard.jsx';
import ViewDrawer from '../../components/ViewDrawer.jsx';
import EditModal from '../../components/EditModal.jsx';
import TableCard from '../../components/TableCard.jsx';
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
  const [inviteOpen, setInviteOpen] = useState(false);
  const currentRole = useAuthStore((s) => s.currentUser.role);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'n' || e.key === 'N') setInviteOpen(true);
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

  function onInviteSubmit({ email, role, sites }) {
    const next = {
      id: `U-${Math.floor(1000 + Math.random()*9000)}`,
      name: email.split('@')[0],
      email,
      role,
      sites,
      status: 'Active',
      lastLogin: '—',
    };
    setRows((r) => [next, ...r]);
    setInviteOpen(false);
    alert('Invitation sent (mock).');
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (u) => (
      <span className={`inline-flex items-center gap-2 px-2 py-1 rounded border text-xs ${ROLE_COLORS[u.role] || ROLE_COLORS.Viewer}`}>{u.role}</span>
    ) },
    { key: 'sites', label: 'Sites', render: (u) => (u.sites||[]).map(s => <span key={s} className="inline-block text-xs px-2 py-0.5 rounded bg-zinc-800 mr-1">{s}</span>) },
    { key: 'status', label: 'Status', render: (u) => (
      <span className={`text-xs px-2 py-0.5 rounded ${u.status==='Active'?'bg-emerald-500/20 text-emerald-300':'bg-zinc-700 text-zinc-300'}`}>{u.status}</span>
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
          <button className="btn" onClick={()=>setInviteOpen(true)} title={currentRole==='Viewer'?"No permission":undefined}>Invite User (N)</button>
        </Guard>
        <button className="btn" onClick={handleExport}>Export CSV (E)</button>
      </div>

      <TableCard title={`${filtered.length} Users`} columns={columns} rows={filtered} />

      {viewRow && (
        <ViewDrawer title="User" onClose={()=>setViewRow(null)}>
          <div className="space-y-2 text-sm">
            <div><span className="text-zinc-400">Name:</span> {viewRow.name}</div>
            <div><span className="text-zinc-400">Email:</span> {viewRow.email}</div>
            <div><span className="text-zinc-400">Role:</span> {viewRow.role}</div>
            <div><span className="text-zinc-400">Sites:</span> {(viewRow.sites||[]).join(', ')}</div>
            <div><span className="text-zinc-400">Status:</span> {viewRow.status}</div>
            <div><span className="text-zinc-400">Last Login:</span> {viewRow.lastLogin}</div>
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

      {inviteOpen && (
        <EditModal title="Invite User" onClose={()=>setInviteOpen(false)} onSave={(vals)=>onInviteSubmit(vals)}>
          <form className="space-y-3" onSubmit={(e)=>e.preventDefault()}>
            <div className="space-y-1">
              <label className="text-sm">Email</label>
              <input type="email" className="input" name="email" placeholder="user@example.com" required />
            </div>
            <div className="space-y-1">
              <label className="text-sm">Role</label>
              <select className="input" name="role" defaultValue="Viewer">
                {['Admin','Manager','Supervisor','Fitter','Viewer'].map(r=> <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm">Sites</label>
              <select multiple className="input min-h-[120px]" name="sites">
                {(siteList||[]).map(s=> <option key={s.code} value={s.code}>{s.code}</option>)}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" className="btn" onClick={()=>setInviteOpen(false)}>Cancel</button>
              <button type="submit" className="btn" onClick={(e)=>{
                const form = e.currentTarget.closest('form');
                const email = form.email.value.trim();
                const role = form.role.value;
                const sites = Array.from(form.sites.selectedOptions).map(o=>o.value);
                onInviteSubmit({ email, role, sites });
              }}>Send Invite</button>
            </div>
          </form>
        </EditModal>
      )}
    </div>
  );
}


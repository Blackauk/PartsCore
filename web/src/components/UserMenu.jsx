import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useModal } from '../contexts/ModalContext.jsx';
import { User, MonitorCog, Bell, Globe, Clock, Building, Power, HelpCircle, History, Star, MessageSquare } from 'lucide-react';
import { setTheme } from '../lib/theme.js';

export default function UserMenu() {
	const navigate = useNavigate();
	const authStoreUser = useAuthStore((s) => s.currentUser);
	const { user: authUser, signOut } = useAuth();
	const setPrefs = useAuthStore((s) => s.setPrefs);
	const setActiveSite = useAuthStore((s) => s.setActiveSite);
	const { openModal } = useModal();
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef(null);

	useEffect(() => {
		function handleEscape(e) {
			if (e.key === 'Escape' && dropdownOpen) {
				setDropdownOpen(false);
			}
		}
		function handleClickOutside(e) {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target) && dropdownOpen) {
				setDropdownOpen(false);
			}
		}
		if (dropdownOpen) {
			document.addEventListener('keydown', handleEscape);
			document.addEventListener('mousedown', handleClickOutside);
		}
		return () => {
			document.removeEventListener('keydown', handleEscape);
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [dropdownOpen]);

	// Use auth context user if available, fallback to authStore
	const currentUser = authUser || authStoreUser;
	const userName = currentUser?.name || authUser?.name || 'User';
	const userEmail = currentUser?.email || authUser?.email || '';
	const userRole = currentUser?.role || (authUser?.roles?.includes('admin') ? 'Admin' : 'User');
	
	if (!currentUser && !authUser) return null;
	const initials = userName.split(' ').map(p=>p[0]).slice(0,2).join('') || 'U';

	const Item = ({ icon:Icon, children, onClick, disabled }) => (
		<button 
			className={`w-full items-center gap-3 px-3 py-2 rounded-lg text-left ${disabled? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-800 cursor-pointer'} flex transition-colors text-sm`}
			onClick={() => { 
				if (!disabled) { 
					onClick?.(); 
					setDropdownOpen(false); 
				} 
			}}
		>
			<Icon size={16} />
			<span>{children}</span>
		</button>
	);

	return (
		<div className="relative" ref={dropdownRef}>
			<button 
				className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 grid place-items-center text-xs hover:bg-zinc-700 transition-colors" 
				onClick={() => setDropdownOpen(v => !v)} 
				aria-haspopup="menu" 
				aria-expanded={dropdownOpen}
				aria-label="Open user menu"
			>
				{initials}
			</button>

			{/* Anchored dropdown */}
			{dropdownOpen && (
				<div className="absolute right-0 mt-2 w-80 rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl z-[70] overflow-hidden">
					{/* User info header */}
					<div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
						<div className="w-10 h-10 rounded-full bg-zinc-800 grid place-items-center text-sm border border-zinc-700 flex-shrink-0">{initials}</div>
						<div className="min-w-0 flex-1">
							<div className="font-medium truncate text-sm">{userName}</div>
							<div className="text-xs text-zinc-400 truncate">{userEmail}</div>
							<span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-600/40">{userRole}</span>
						</div>
					</div>

					{/* Menu items */}
					<div className="p-2 space-y-1">
						<div className="px-2 pt-2 pb-1 text-[10px] uppercase text-zinc-500">Account</div>
						<Item icon={User} onClick={()=>openModal('profile')}>Profile</Item>

						<div className="px-2 pt-2 pb-1 text-[10px] uppercase text-zinc-500">Preferences</div>
						<div className="flex items-center gap-2 px-3 py-2">
							<MonitorCog size={16} />
							<span className="text-sm mr-auto">Theme</span>
							<select 
								className="input text-xs" 
								value={(currentUser?.prefs || authStoreUser?.prefs)?.theme || 'dark'} 
								onChange={(e)=>{ 
									setPrefs({ theme: e.target.value }); 
									setTheme(e.target.value); 
								}}
								onClick={(e) => e.stopPropagation()}
							>
								<option value="light">Light</option>
								<option value="dark">Dark</option>
								<option value="auto">Auto</option>
							</select>
						</div>
						<Item icon={Bell} onClick={()=>openModal('notifications')}>Notifications…</Item>
						<div className="flex items-center gap-2 px-3 py-2">
							<Globe size={16} />
							<span className="text-sm mr-auto">Language</span>
							<select 
								className="input text-xs" 
								value={(currentUser?.prefs || authStoreUser?.prefs)?.locale || 'en-GB'} 
								onChange={(e)=>setPrefs({ locale: e.target.value })}
								onClick={(e) => e.stopPropagation()}
							>
								<option value="en-GB">English (UK)</option>
								<option value="en-US">English (US)</option>
							</select>
						</div>
						<div className="flex items-center gap-2 px-3 py-2">
							<Clock size={16} />
							<span className="text-sm mr-auto">Time zone</span>
							<span className="text-xs text-zinc-400">{(currentUser?.prefs || authStoreUser?.prefs)?.tz || 'Europe/London'}</span>
						</div>

						<div className="px-2 pt-2 pb-1 text-[10px] uppercase text-zinc-500">Context</div>
						<div className="flex items-center gap-2 px-3 py-2">
							<Building size={16} />
							<span className="text-sm mr-auto">Active site</span>
							<select 
								className="input text-xs" 
								value={(currentUser?.activeSite || authStoreUser?.activeSite) || ''} 
								onChange={(e)=>setActiveSite(e.target.value)}
								onClick={(e) => e.stopPropagation()}
							>
								{((currentUser?.sites || authStoreUser?.sites) || []).map((c)=> <option key={c} value={c}>{c}</option>)}
							</select>
						</div>

						<div className="px-2 pt-2 pb-1 text-[10px] uppercase text-zinc-500">Help & About</div>
						<Item icon={HelpCircle} onClick={()=>{navigate('/help-centre'); setDropdownOpen(false);}}>Help Centre</Item>
						<Item icon={MessageSquare} onClick={()=>{navigate('/feedback'); setDropdownOpen(false);}}>Feedback</Item>
						<Item icon={History} onClick={()=>openModal('changelog')}>What's new</Item>

						<div className="px-2 pt-2 pb-1 text-[10px] uppercase text-zinc-500">Productivity</div>
						<Item icon={History} onClick={()=>openModal('shortcuts')}>Keyboard shortcuts</Item>
						<Item icon={Star} onClick={()=>openModal('quick')}>Quick actions</Item>

						<div className="px-2 pt-2 pb-1 text-[10px] uppercase text-zinc-500">Session</div>
						<Item icon={Power} onClick={()=>openModal('confirmLogout')}>Sign out</Item>
					</div>
				</div>
			)}
		</div>
	);
}



import { useState } from 'react';
import { useSettings } from '../context/SettingsContext.jsx';
import { CURRENCY_OPTIONS, formatCurrency } from '../lib/currency.js';
import { useTheme } from '../hooks/useTheme.js';
import { useApp } from '../context/AppContext.jsx';
import FormField from '../components/FormField.jsx';
import { Globe, DollarSign, Palette, Bell, Database, User, Save } from 'lucide-react';

export default function Settings() {
  const { settings, setCurrency } = useSettings();
  const { theme, setTheme } = useTheme();
  const { user } = useApp();
  const [saving, setSaving] = useState(false);

  // Local state for form fields (in a real app, these would be managed by SettingsContext)
  const [localSettings, setLocalSettings] = useState({
    companyName: '',
    defaultSite: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'DD/MM/YYYY',
    language: 'en',
    decimalPrecision: 2,
    showSymbolBefore: true,
    accentColor: '#6a5df6',
    fontSize: 'normal',
    emailAlerts: true,
    pushNotifications: true,
    weeklySummary: false,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real app, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 500));
      // toast('Settings saved successfully');
      setSaving(false);
    } catch (error) {
      // toast('Failed to save settings', 'error');
      setSaving(false);
    }
  };

  const previewValue = 13788.50;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-primary">Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        {/* General */}
        <section className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={20} className="text-secondary" />
            <h2 className="text-lg font-medium text-primary">General</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Company Name" htmlFor="companyName">
              <input
                id="companyName"
                name="companyName"
                type="text"
                className="input w-full"
                value={localSettings.companyName}
                onChange={(e) => setLocalSettings({ ...localSettings, companyName: e.target.value })}
                placeholder="Your Company Ltd"
              />
            </FormField>
            <FormField label="Default Site / Location" htmlFor="defaultSite">
              <select
                id="defaultSite"
                name="defaultSite"
                className="input w-full"
                value={localSettings.defaultSite}
                onChange={(e) => setLocalSettings({ ...localSettings, defaultSite: e.target.value })}
              >
                <option value="">Select site...</option>
                <option value="atlas-road">Atlas Road</option>
                <option value="vrcb">VRCB</option>
                <option value="flat-iron">Flat Iron</option>
              </select>
            </FormField>
            <FormField label="Timezone" htmlFor="timezone">
              <input
                id="timezone"
                name="timezone"
                type="text"
                className="input w-full"
                value={localSettings.timezone}
                onChange={(e) => setLocalSettings({ ...localSettings, timezone: e.target.value })}
                readOnly
              />
              <p className="text-xs text-muted mt-1">Auto-detected from browser</p>
            </FormField>
            <FormField label="Date Format" htmlFor="dateFormat">
              <select
                id="dateFormat"
                name="dateFormat"
                className="input w-full"
                value={localSettings.dateFormat}
                onChange={(e) => setLocalSettings({ ...localSettings, dateFormat: e.target.value })}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </FormField>
            <FormField label="Language" htmlFor="language">
              <select
                id="language"
                name="language"
                className="input w-full"
                value={localSettings.language}
                onChange={(e) => setLocalSettings({ ...localSettings, language: e.target.value })}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </FormField>
          </div>
        </section>

        {/* Currency & Regional */}
        <section className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={20} className="text-secondary" />
            <h2 className="text-lg font-medium text-primary">Currency & Regional</h2>
          </div>
          <div className="space-y-4">
            <FormField label="Default Currency" htmlFor="currency">
              <select
                id="currency"
                name="currency"
                value={settings.currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="input w-full sm:w-64"
              >
                {CURRENCY_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </FormField>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.showSymbolBefore}
                  onChange={(e) => setLocalSettings({ ...localSettings, showSymbolBefore: e.target.checked })}
                  className="text-primary"
                />
                <span className="text-sm text-primary">Show currency symbol before amount</span>
              </label>
            </div>
            <FormField label="Decimal Precision" htmlFor="decimalPrecision">
              <select
                id="decimalPrecision"
                name="decimalPrecision"
                className="input w-full sm:w-64"
                value={localSettings.decimalPrecision}
                onChange={(e) => setLocalSettings({ ...localSettings, decimalPrecision: parseInt(e.target.value) })}
              >
                <option value="0">0 decimals (e.g., £13,789)</option>
                <option value="2">2 decimals (e.g., £13,788.50)</option>
              </select>
            </FormField>
            <div className="p-4 bg-elevated rounded-lg border border-base">
              <p className="text-xs text-secondary mb-2">Preview:</p>
              <p className="text-lg font-semibold text-primary">
                {formatCurrency(previewValue, settings.currency, localSettings.decimalPrecision)}
              </p>
            </div>
          </div>
        </section>

        {/* Theme & Appearance */}
        <section className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette size={20} className="text-secondary" />
            <h2 className="text-lg font-medium text-primary">Theme & Appearance</h2>
          </div>
          <div className="space-y-4">
            <FormField label="Theme" htmlFor="theme">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={theme === 'light'}
                    onChange={() => setTheme('light')}
                    className="text-primary"
                  />
                  <span className="text-sm text-primary">Light</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={theme === 'dark'}
                    onChange={() => setTheme('dark')}
                    className="text-primary"
                  />
                  <span className="text-sm text-primary">Dark</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value="auto"
                    checked={false}
                    onChange={() => {
                      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
                      setTheme(prefersLight ? 'light' : 'dark');
                    }}
                    className="text-primary"
                  />
                  <span className="text-sm text-primary">Auto (System)</span>
                </label>
              </div>
            </FormField>
            <FormField label="Font Size" htmlFor="fontSize">
              <select
                id="fontSize"
                name="fontSize"
                className="input w-full sm:w-64"
                value={localSettings.fontSize}
                onChange={(e) => setLocalSettings({ ...localSettings, fontSize: e.target.value })}
              >
                <option value="compact">Compact</option>
                <option value="normal">Normal</option>
                <option value="large">Large</option>
              </select>
            </FormField>
          </div>
        </section>

        {/* Notifications */}
        <section className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={20} className="text-secondary" />
            <h2 className="text-lg font-medium text-primary">Notifications</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.emailAlerts}
                onChange={(e) => setLocalSettings({ ...localSettings, emailAlerts: e.target.checked })}
                className="text-primary"
              />
              <span className="text-sm text-primary">Email alerts (PO approvals, low stock, deliveries)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.pushNotifications}
                onChange={(e) => setLocalSettings({ ...localSettings, pushNotifications: e.target.checked })}
                className="text-primary"
              />
              <span className="text-sm text-primary">Push/browser notifications</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.weeklySummary}
                onChange={(e) => setLocalSettings({ ...localSettings, weeklySummary: e.target.checked })}
                className="text-primary"
              />
              <span className="text-sm text-primary">Weekly summary reports</span>
            </label>
          </div>
        </section>

        {/* Data & Integrations */}
        <section className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database size={20} className="text-secondary" />
            <h2 className="text-lg font-medium text-primary">Data & Integrations</h2>
          </div>
          <div className="space-y-4">
            <div className="flex gap-2">
              <button className="btn-secondary">Export Data (CSV)</button>
              <button className="btn-secondary">Export Data (JSON)</button>
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary">Import Parts</button>
              <button className="btn-secondary">Import Suppliers</button>
            </div>
            <FormField label="API Key" htmlFor="apiKey">
              <div className="flex gap-2">
                <input
                  id="apiKey"
                  name="apiKey"
                  type="text"
                  className="input flex-1"
                  value="••••••••••••••••"
                  readOnly
                />
                <button className="btn-secondary">Generate New</button>
              </div>
              <p className="text-xs text-muted mt-1">For integration with external systems</p>
            </FormField>
          </div>
        </section>

        {/* Account / Audit */}
        <section className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <User size={20} className="text-secondary" />
            <h2 className="text-lg font-medium text-primary">Account</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-secondary mb-1">Logged-in User</p>
                <p className="text-sm text-primary">{user?.name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-secondary mb-1">Last Login</p>
                <p className="text-sm text-primary">Just now</p>
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={false}
                onChange={() => {}}
                className="text-primary"
              />
              <span className="text-sm text-primary">Enable Two-Factor Authentication (2FA)</span>
              <span className="text-xs text-muted">(Admin accounts only)</span>
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}

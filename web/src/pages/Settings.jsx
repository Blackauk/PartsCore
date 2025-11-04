import { useSettings } from '../context/SettingsContext.jsx';
import { CURRENCY_OPTIONS } from '../lib/currency.js';

export default function Settings() {
  const { settings, setCurrency } = useSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>
      
      <div className="card p-6 space-y-6">
        <div>
          <h2 className="text-lg font-medium text-primary mb-4">General</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <label htmlFor="currency" className="w-40 text-sm text-primary">Currency</label>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



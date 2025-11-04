import StatCard from '../components/StatCard.jsx';
import TableCard from '../components/TableCard.jsx';
import { mock } from '../data/mock.js';
import { formatNumber } from '../lib/formatters.js';
import { formatCurrency } from '../lib/currency.js';
import { useSettings } from '../context/SettingsContext.jsx';

export default function Dashboard() {
  const { settings } = useSettings();
  const { stockValue, lowStock, inboundPOs, recentMovements, fastMovers, ageing, compliance } = mock();
  return (
    <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
      <StatCard title="Stock Value" value={formatCurrency(stockValue.total, settings.currency)} subtitle={`${stockValue.change >= 0 ? '+' : ''}${stockValue.change}% vs 30d`} trend={stockValue.change} />
      <StatCard title="Low-Stock Alerts" value={formatNumber(lowStock.count)} subtitle="Below threshold" />
      <StatCard title="Outstanding POs" value={formatNumber(inboundPOs.count)} subtitle="Due this week" />
      <StatCard title="Ageing > 90d" value={formatNumber(ageing.count)} subtitle="No movement" />

      <div className="col-span-full grid md:grid-cols-2 gap-6">
        <TableCard title="Recent Movements" rows={recentMovements} columns={[
          { key: 'date', label: 'Date' },
          { key: 'type', label: 'Type' },
          { key: 'part', label: 'Part' },
          { key: 'qty', label: 'Qty' },
          { key: 'site', label: 'Site' },
        ]} />
        <TableCard title="Low-Stock (Top 5)" rows={lowStock.items} columns={[
          { key: 'part', label: 'Part' },
          { key: 'qty', label: 'Qty' },
          { key: 'min', label: 'Min' },
          { key: 'site', label: 'Site' },
        ]} />
      </div>

      <div className="col-span-full grid md:grid-cols-2 gap-6">
        <TableCard title="Fast Movers (30d)" rows={fastMovers} columns={[
          { key: 'part', label: 'Part' },
          { key: 'issues', label: 'Issues' },
        ]} />
        <TableCard title="Sites Compliance" rows={compliance} columns={[
          { key: 'site', label: 'Site' },
          { key: 'missing', label: 'Missing Data' },
        ]} />
      </div>
    </div>
  );
}



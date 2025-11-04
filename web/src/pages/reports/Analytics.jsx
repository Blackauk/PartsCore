import { useMemo, useRef, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip as ReTooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, LineChart, Line, CartesianGrid } from 'recharts';
import { kpis, stockByCategory, stockBySite, topIssued, usageTrend, supplierOnTimeTrend } from '../../data/mockReports.js';
import StatCard from '../../components/StatCard.jsx';
import { exportToCSV } from '../../utils/csvUtils.js';

const COLORS = ['#60a5fa','#34d399','#fbbf24','#f472b6','#a78bfa','#fb7185','#22d3ee','#fde047'];

function downloadChartPNG(container) {
  if (!container) return;
  const svg = container.querySelector('svg');
  if (!svg) return;
  const xml = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  const svg64 = btoa(unescape(encodeURIComponent(xml)));
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'chart.png';
    a.click();
  };
  img.src = 'data:image/svg+xml;base64,' + svg64;
}

export default function Analytics() {
  const [range, setRange] = useState('30');
  const pieRef = useRef(null);
  const barRef = useRef(null);
  const siteRef = useRef(null);
  const lineRef = useRef(null);

  const top10 = useMemo(() => topIssued.slice(0, 10), []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <h1 className="text-xl font-semibold">Analytics</h1>
        <div className="flex items-center gap-2">
          <select className="input text-sm px-2" value={range} onChange={(e)=>setRange(e.target.value)}>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">YTD</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Stock Value" value={kpis.totalStockValue} format="currency" />
        <StatCard title="Low-Stock Count" value={kpis.lowStockCount} />
        <StatCard title="Open POs" value={kpis.openPOs} />
        <StatCard title="Returns (30d)" value={kpis.returns30d} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-4" ref={pieRef}>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="font-medium">Stock Value by Category</h2>
            <div className="ml-auto flex gap-2">
              <button className="btn" onClick={()=>downloadChartPNG(pieRef.current)}>Export PNG</button>
              <button className="btn" onClick={()=>exportToCSV('stock_by_category.csv',['category','qty','value'],stockByCategory)}>Export CSV</button>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stockByCategory} dataKey="value" nameKey="category" cx="50%" cy="50%" outerRadius={100}>
                  {stockByCategory.map((_, i)=>(<Cell key={i} fill={COLORS[i%COLORS.length]} />))}
                </Pie>
                <ReTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4" ref={barRef}>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="font-medium">Top 10 Issued (30d)</h2>
            <div className="ml-auto flex gap-2">
              <button className="btn" onClick={()=>downloadChartPNG(barRef.current)}>Export PNG</button>
              <button className="btn" onClick={()=>exportToCSV('top_issued.csv',['sku','name','qty'],top10)}>Export CSV</button>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top10}>
                <XAxis dataKey="sku" /><YAxis />
                <ReTooltip />
                <Bar dataKey="qty" fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4" ref={siteRef}>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="font-medium">Stock by Site</h2>
            <div className="ml-auto flex gap-2">
              <button className="btn" onClick={()=>downloadChartPNG(siteRef.current)}>Export PNG</button>
              <button className="btn" onClick={()=>exportToCSV('stock_by_site.csv',['site','qty','value'],stockBySite)}>Export CSV</button>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockBySite}>
                <XAxis dataKey="site" /><YAxis />
                <ReTooltip />
                <Bar dataKey="value" stackId="a" fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4" ref={lineRef}>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="font-medium">Usage Trend (90d)</h2>
            <div className="ml-auto flex gap-2">
              <button className="btn" onClick={()=>downloadChartPNG(lineRef.current)}>Export PNG</button>
              <button className="btn" onClick={()=>exportToCSV('usage_trend.csv',['date','issues','receipts'],usageTrend)}>Export CSV</button>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" hide />
                <YAxis />
                <ReTooltip />
                <Line type="monotone" dataKey="issues" stroke="#fb7185" dot={false} />
                <Line type="monotone" dataKey="receipts" stroke="#60a5fa" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="font-medium">Supplier On-time % (12m)</h2>
            <div className="ml-auto flex gap-2">
              <button className="btn" onClick={()=>exportToCSV('supplier_ontime.csv',['month','onTime'],supplierOnTimeTrend)}>Export CSV</button>
            </div>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={supplierOnTimeTrend}>
                <XAxis dataKey="month" hide />
                <YAxis domain={[60,100]} />
                <ReTooltip />
                <Line type="monotone" dataKey="onTime" stroke="#a78bfa" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}


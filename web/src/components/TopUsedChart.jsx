import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { linkIssuesReport } from '../lib/links.js';

export default function TopUsedChart({ data = [] }) {
  const navigate = useNavigate();
  return (
    <div style={{width:'100%', height:300}}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ left: 40, right: 10, top: 10, bottom: 10 }}>
          <XAxis type="number" hide />
          <YAxis dataKey="part" type="category" width={90} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
          <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="qty" fill="#60A5FA" onClick={(d)=>navigate(linkIssuesReport(d.part))} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}



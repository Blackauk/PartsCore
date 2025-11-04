import { Link, useNavigate } from 'react-router-dom';
import { toast } from '../lib/toast.js';

export default function TasksList({ tasks }) {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <section>
        <div className="text-sm font-medium mb-2">Deliveries Pending Inspection</div>
        <ul className="space-y-2">
          {tasks.grnsPending.map((g) => (
            <li key={g.id} className="flex items-center justify-between text-sm">
              <span>{g.id} ({g.supplier})</span>
              <button className="btn btn-xs" onClick={()=>navigate(`/procurement/deliveries/${g.id}`)}>Open GRN</button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="text-sm font-medium mb-2">Parts Requests to Fulfill</div>
        <ul className="space-y-2">
          {tasks.partRequests.map((r) => (
            <li key={r.id} className="flex items-center justify-between text-sm">
              <span>{r.id} ({r.site} / {r.plant})</span>
              <button className="btn btn-xs" onClick={()=>navigate(`/movements/issue?reqId=${r.id}`)}>Pick/Issue</button>
            </li>
          ))}
        </ul>
      </section>

      {tasks.posToApprove?.length ? (
        <section>
          <div className="text-sm font-medium mb-2">POs to Approve</div>
          <ul className="space-y-2">
            {tasks.posToApprove.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm">
                <span>{p.id} ({p.supplier})</span>
                <button className="btn btn-xs" onClick={()=>navigate(`/procurement/purchase-orders/${p.id}`)}>Review PO</button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}



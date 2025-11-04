import { useNavigate } from 'react-router-dom';

export default function QuickButtons() {
  const navigate = useNavigate();
  const Btn = ({ label, to }) => (
    <button className="btn" onClick={()=>navigate(to)}>{label}</button>
  );
  return (
    <div className="flex flex-wrap gap-2">
      <Btn label="+ Book Part Out" to="/movements/issue" />
      <Btn label="+ Receive Delivery" to="/procurement/deliveries/pending" />
      <Btn label="+ Create Purchase Order" to="/procurement/purchase-orders/new" />
      <Btn label="🔍 Find Part" to="/inventory/master" />
    </div>
  );
}



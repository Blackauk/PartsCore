import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';

export default function QuickButtons({ onOpenCreatePO }) {
  const navigate = useNavigate();
  const createPOButtonRef = useRef(null);
  
  const Btn = ({ label, to, onClick, buttonRef }) => (
    <button 
      ref={buttonRef}
      className="btn" 
      onClick={onClick || (() => navigate(to))}
    >
      {label}
    </button>
  );
  
  return (
    <div className="flex flex-wrap gap-2">
      <Btn label="+ Book Part Out" to="/movements/issue" />
      <Btn label="+ Receive Delivery" to="/procurement/deliveries/pending" />
      <Btn 
        label="+ Create Purchase Order" 
        onClick={() => onOpenCreatePO?.(createPOButtonRef)}
        buttonRef={createPOButtonRef}
      />
      <Btn label="🔍 Find Part" to="/inventory/master" />
    </div>
  );
}



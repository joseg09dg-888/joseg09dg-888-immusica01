import React, { useEffect, useState } from 'react';
import { getPlans, createPayment } from '../services/api';
import PlanCard from './PlanCard';
import { Loader2 } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  isContactRequired?: boolean;
}

const PlansList: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPlans()
      .then(res => setPlans(res.data))
      .catch(err => {
        console.error(err);
        setError('Error al cargar los planes');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelectPlan = async (plan: Plan) => {
    const email = prompt('Ingresa tu correo electrónico:', 'artista@email.com');
    if (!email) return;

    try {
      const res = await createPayment(plan.id, email);
      const { paymentUrl } = res.data;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        alert('Pago iniciado. Redirigiendo...');
      }
    } catch (err) {
      alert('Error al iniciar el pago');
    }
  };

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="animate-spin text-electric-purple" size={48} />
    </div>
  );

  if (error) return (
    <div className="h-96 flex items-center justify-center text-white/40 font-bold uppercase tracking-widest">
      {error}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {plans.map(plan => (
        <PlanCard key={plan.id} plan={plan} onSelect={handleSelectPlan} />
      ))}
    </div>
  );
};

export default PlansList;

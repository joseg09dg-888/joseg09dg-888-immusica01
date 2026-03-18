import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Server, Database, Activity, Cpu, HardDrive, ShieldCheck } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { toast } from 'sonner';

const AdminInfrastructure = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const data = await adminService.getResourceStatus();
      setStatus(data);
    } catch (error) {
      toast.error('Error al cargar estado de infraestructura');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Activity className="animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Infraestructura & Salud (OpenClaw)</h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
          <ShieldCheck size={16} />
          Sistema Protegido
        </div>
      </div>

      {/* Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ResourceCard 
          icon={<Cpu size={24} />}
          title="CPU Usage"
          value={`${status?.cpu?.usage?.toFixed(1) || 0}%`}
          detail={`${status?.cpu?.cores || 0} Cores`}
          color="indigo"
        />
        <ResourceCard 
          icon={<HardDrive size={24} />}
          title="Memory"
          value={`${status?.memory?.usage?.toFixed(1) || 0}%`}
          detail={`${(status?.memory?.free / 1024 / 1024 / 1024).toFixed(1) || 0}GB Free`}
          color="emerald"
        />
        <ResourceCard 
          icon={<Database size={24} />}
          title="Database"
          value="Healthy"
          detail="SQLite Enterprise"
          color="amber"
        />
        <ResourceCard 
          icon={<Server size={24} />}
          title="Uptime"
          value={`${Math.floor(status?.uptime / 3600) || 0}h`}
          detail="Active Session"
          color="slate"
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Activity size={20} className="text-indigo-600" />
            Rendimiento en Tiempo Real
          </h3>
          <div className="space-y-6">
            <StatBar label="Latencia API" value={45} max={200} unit="ms" />
            <StatBar label="Carga de Red" value={12} max={100} unit="%" />
            <StatBar label="Escritura DB" value={8} max={100} unit="ops/s" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Server size={20} className="text-emerald-600" />
            Nodos Activos
          </h3>
          <div className="space-y-4">
            <NodeItem name="API Gateway" status="online" />
            <NodeItem name="Media Processor" status="online" />
            <NodeItem name="AI Engine" status="online" />
            <NodeItem name="Database Node" status="online" />
          </div>
        </div>
      </div>
    </div>
  );
};

const ResourceCard = ({ icon, title, value, detail, color }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
  >
    <div className={`w-12 h-12 rounded-xl bg-${color}-100 text-${color}-600 flex items-center justify-center mb-4`}>
      {icon}
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
    <p className="text-xs text-slate-400 mt-1">{detail}</p>
  </motion.div>
);

const StatBar = ({ label, value, max, unit }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span className="text-slate-600 font-medium">{label}</span>
      <span className="text-slate-900 font-bold">{value}{unit}</span>
    </div>
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        className="h-full bg-indigo-600 rounded-full"
      />
    </div>
  </div>
);

const NodeItem = ({ name, status }: any) => (
  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
    <span className="text-sm font-medium text-slate-700">{name}</span>
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
      <span className="text-xs font-bold uppercase text-slate-500">{status}</span>
    </div>
  </div>
);

export default AdminInfrastructure;

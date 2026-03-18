import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings, Save, RefreshCw, Database, Globe, Shield, Zap } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { toast } from 'sonner';

const AdminConfig = () => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const data = await adminService.getAiConfig();
      setConfig(data);
    } catch (error) {
      toast.error('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminService.updateAiConfig(config);
      toast.success('Configuración guardada correctamente');
    } catch (error) {
      toast.error('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><RefreshCw className="animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Configuración del Sistema (OpenClaw)</h2>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
          Guardar Cambios
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Zap size={20} className="text-amber-500" />
              Parámetros de IA (OpenClaw)
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ConfigInput 
                  label="Modelo Principal" 
                  value={config?.model || 'gemini-3-flash-preview'} 
                  onChange={(v: any) => setConfig({...config, model: v})}
                />
                <ConfigInput 
                  label="Temperatura" 
                  type="number"
                  value={config?.temperature || 0.7} 
                  onChange={(v: any) => setConfig({...config, temperature: parseFloat(v)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Instrucciones del Sistema</label>
                <textarea 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-32"
                  value={config?.systemInstruction || ''}
                  onChange={(e) => setConfig({...config, systemInstruction: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Globe size={20} className="text-indigo-600" />
              Configuración Global
            </h3>
            <div className="space-y-4">
              <ConfigToggle 
                label="Modo Mantenimiento" 
                enabled={config?.maintenanceMode} 
                onChange={(v: any) => setConfig({...config, maintenanceMode: v})}
              />
              <ConfigToggle 
                label="Registro de Usuarios" 
                enabled={config?.allowRegistration} 
                onChange={(v: any) => setConfig({...config, allowRegistration: v})}
              />
              <ConfigToggle 
                label="Pagos Activos" 
                enabled={config?.paymentsEnabled} 
                onChange={(v: any) => setConfig({...config, paymentsEnabled: v})}
              />
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield size={20} className="text-indigo-300" />
              Seguridad
            </h3>
            <p className="text-indigo-200 text-sm mb-6">
              Los cambios en la configuración del sistema afectan a todos los usuarios en tiempo real.
            </p>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-indigo-300">Último backup:</span>
                <span className="font-bold">Hace 2 horas</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-indigo-300">Versión Core:</span>
                <span className="font-bold">v2.4.0-enterprise</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Database size={20} className="text-slate-600" />
              Base de Datos
            </h3>
            <div className="space-y-4">
              <button className="w-full py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
                Optimizar Índices
              </button>
              <button className="w-full py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
                Limpiar Logs
              </button>
              <button className="w-full py-2 bg-rose-50 text-rose-600 rounded-lg text-sm font-medium hover:bg-rose-100 transition-colors">
                Resetear Caché
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfigInput = ({ label, value, onChange, type = "text" }: any) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-slate-600">{label}</label>
    <input 
      type={type}
      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const ConfigToggle = ({ label, enabled, onChange }: any) => (
  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
    <span className="text-sm font-medium text-slate-700">{label}</span>
    <button 
      onClick={() => onChange(!enabled)}
      className={`w-12 h-6 rounded-full transition-colors relative ${enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
    >
      <motion.div 
        animate={{ x: enabled ? 26 : 2 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </button>
  </div>
);

export default AdminConfig;

import React, { useEffect, useState } from 'react';
import { getSystemLogs, getResourceStatus, getAuditLogs } from '../../services/api';
import { Terminal, Activity, Cpu, HardDrive, Shield } from 'lucide-react';

const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [resources, setResources] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSystemLogs(100), getResourceStatus(), getAuditLogs(100)])
      .then(([logsRes, resourcesRes, auditRes]) => {
        setLogs(Array.isArray(logsRes.data.actionLogs) ? logsRes.data.actionLogs : []);
        setResources(resourcesRes.data);
        setAuditLogs(Array.isArray(auditRes.data) ? auditRes.data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-electric-purple animate-pulse font-black uppercase tracking-widest">Cargando Logs...</div>
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-white/10 space-y-4">
          <div className="flex items-center gap-3 text-electric-purple">
            <Cpu size={20} />
            <h3 className="text-[10px] font-black uppercase tracking-widest">CPU & Memory</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-white/40">CPU Load</span>
              <span className="font-mono">{resources?.cpu?.load || '0'}%</span>
            </div>
            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
              <div className="bg-electric-purple h-full" style={{ width: `${resources?.cpu?.load || 0}%` }} />
            </div>
            <div className="flex justify-between text-xs pt-2">
              <span className="text-white/40">Memory</span>
              <span className="font-mono">{resources?.memory?.used || '0'}MB / {resources?.memory?.total || '0'}MB</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border-white/10 space-y-4">
          <div className="flex items-center gap-3 text-electric-purple">
            <HardDrive size={20} />
            <h3 className="text-[10px] font-black uppercase tracking-widest">Storage & Uptime</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Disk Usage</span>
              <span className="font-mono">{resources?.disk?.percent || '0'}%</span>
            </div>
            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
              <div className="bg-electric-purple h-full" style={{ width: `${resources?.disk?.percent || 0}%` }} />
            </div>
            <div className="flex justify-between text-xs pt-2">
              <span className="text-white/40">Uptime</span>
              <span className="font-mono">{resources?.uptime || '0s'}</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border-white/10 space-y-4">
          <div className="flex items-center gap-3 text-neon-pink">
            <Activity size={20} />
            <h3 className="text-[10px] font-black uppercase tracking-widest">Database Stats</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-xl font-display font-black italic">{resources?.db?.tables || 0}</div>
              <div className="text-[8px] font-black uppercase tracking-widest text-white/20">Tables</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-display font-black italic">{resources?.db?.size || '0KB'}</div>
              <div className="text-[8px] font-black uppercase tracking-widest text-white/20">Size</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-display font-black uppercase tracking-tighter italic flex items-center gap-3">
          <Shield className="text-cyber-cyan" size={24} />
          Audit Logs (User Actions)
        </h2>

        <div className="glass-card overflow-hidden border-white/10 bg-black/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/40">Usuario</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/40">Acción</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/40">Entidad</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/40">IP</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/40">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-white/20 uppercase font-black tracking-widest">
                      No hay logs de auditoría registrados
                    </td>
                  </tr>
                ) : (
                  auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white">{log.user_name || 'System'}</div>
                        <div className="text-[9px] text-white/20">{log.user_email || '-'}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-cyber-cyan font-bold">{log.action}</span>
                      </td>
                      <td className="p-4 text-white/60">
                        {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}
                      </td>
                      <td className="p-4 text-white/40">{log.ip_address}</td>
                      <td className="p-4 text-white/30">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-display font-black uppercase tracking-tighter italic flex items-center gap-3">
          <Terminal className="text-electric-purple" size={24} />
          Últimas Acciones de IA
        </h2>

        <div className="glass-card overflow-hidden border-white/10 bg-black/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/40">Acción</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/40">Detalles</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/40">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-12 text-center text-white/20 uppercase font-black tracking-widest">
                      No hay logs registrados
                    </td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <span className="text-electric-purple font-bold">{log.action}</span>
                      </td>
                      <td className="p-4 text-white/60">{log.details}</td>
                      <td className="p-4 text-white/30">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;

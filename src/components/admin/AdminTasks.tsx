import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Clock, AlertCircle, Play, Pause, Trash2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { toast } from 'sonner';

const AdminTasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await adminService.getTasks();
      setTasks(data);
    } catch (error) {
      toast.error('Error al cargar tareas');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (taskId: number, action: string) => {
    try {
      await adminService.processTask(taskId, action);
      toast.success(`Tarea ${action === 'run' ? 'iniciada' : 'pausada'}`);
      fetchTasks();
    } catch (error) {
      toast.error('Error al procesar tarea');
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Clock className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tareas del Sistema (OpenClaw)</h2>
        <button 
          onClick={fetchTasks}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Actualizar
        </button>
      </div>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${
                task.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                task.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                'bg-slate-100 text-slate-600'
              }`}>
                {task.status === 'completed' ? <CheckCircle size={20} /> :
                 task.status === 'pending' ? <Clock size={20} /> :
                 <AlertCircle size={20} />}
              </div>
              <div>
                <h3 className="font-medium text-slate-900">{task.type}</h3>
                <p className="text-sm text-slate-500">{task.details}</p>
                <span className="text-xs text-slate-400">
                  {new Date(task.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {task.status === 'pending' && (
                <button 
                  onClick={() => handleAction(task.id, 'run')}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Ejecutar"
                >
                  <Play size={18} />
                </button>
              )}
              {task.status === 'running' && (
                <button 
                  onClick={() => handleAction(task.id, 'pause')}
                  className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  title="Pausar"
                >
                  <Pause size={18} />
                </button>
              )}
              <button className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          </motion.div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500 text-sm">No hay tareas pendientes</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTasks;

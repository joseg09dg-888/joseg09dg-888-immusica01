import React, { useState } from 'react';
import { bulkUploadFiles } from '../services/api';
import { motion } from 'motion/react';
import { Upload, FileText, CheckCircle2, Loader2, AlertCircle, Music, Database, Sparkles, Zap, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const CatalogMigration: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      const res = await bulkUploadFiles(files);
      setResults(res.data.results || []);
      toast.success('Migration completed successfully');
      setFiles([]);
    } catch (err: any) {
      toast.error('Migration error: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyber-cyan/5 blur-[120px] rounded-full -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neon-pink/5 blur-[120px] rounded-full -ml-64 -mb-64" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        <div className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/20 text-cyber-cyan text-[10px] font-black uppercase tracking-widest"
          >
            <Sparkles size={12} />
            <span>AI-Powered Neural Migration</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl lg:text-9xl font-display font-black tracking-tighter uppercase leading-[0.85] italic"
          >
            Catalog <br />
            <span className="text-cyber-cyan">Migration</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 font-medium tracking-wide max-w-xl mx-auto text-lg"
          >
            Bulk upload your music catalog. Our AI extracts metadata from PDFs, images, and audio files automatically.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-12 space-y-10 border-white/5 bg-white/[0.02]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-cyber-cyan">
                  <div className="w-10 h-10 rounded-xl bg-cyber-cyan/10 flex items-center justify-center">
                    <Database size={20} />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em]">Neural Input</h3>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">PDF, Audio, Images</span>
                </div>
              </div>

              <div 
                className="border-2 border-dashed border-white/10 rounded-[40px] p-20 text-center space-y-8 hover:border-cyber-cyan/40 transition-all cursor-pointer relative group bg-white/[0.01] hover:bg-white/[0.02]"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files) setFiles(Array.from(e.dataTransfer.files));
                }}
              >
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFileChange} 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20 group-hover:scale-110 group-hover:text-cyber-cyan transition-all duration-500 relative">
                  <div className="absolute inset-0 bg-cyber-cyan/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Upload size={40} className="relative z-10" />
                </div>
                <div className="space-y-3">
                  <p className="text-2xl font-display font-black uppercase tracking-tight">Initialize Neural Link</p>
                  <p className="text-sm text-white/40 max-w-xs mx-auto leading-relaxed">Drag & drop your assets here or click to browse your local storage.</p>
                </div>
              </div>

              {files.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20">Staged Assets ({files.length})</h4>
                    <button 
                      onClick={() => setFiles([])} 
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neon-pink hover:scale-105 transition-all"
                    >
                      <Trash2 size={12} />
                      <span>Purge All</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {files.map((file, i) => (
                      <div key={i} className="flex items-center gap-4 p-5 bg-white/[0.02] rounded-3xl border border-white/5 group hover:border-white/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white/60 transition-colors">
                          <FileText size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">{file.name}</p>
                          <p className="text-[10px] text-white/20 uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full py-6 bg-cyber-cyan text-ink rounded-[2rem] font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl shadow-cyber-cyan/20 hover:shadow-cyber-cyan/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-4 relative overflow-hidden group/btn"
                  >
                    <div className="absolute inset-0 bg-white translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-out" />
                    <span className="relative z-10 flex items-center gap-4">
                      {uploading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                      <span>{uploading ? 'Processing Neural Catalog...' : 'Initialize Migration'}</span>
                    </span>
                  </button>
                </motion.div>
              )}
            </div>

            {results.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-12 space-y-10 border-white/5 bg-white/[0.02]"
              >
                <div className="flex items-center gap-4 text-emerald-400">
                  <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em]">Migration Success</h3>
                </div>
                <div className="space-y-4">
                  {results.map((res, i) => (
                    <div key={i} className="flex items-center justify-between p-8 bg-emerald-400/[0.03] rounded-[32px] border border-emerald-400/10 group hover:bg-emerald-400/[0.05] transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-emerald-400/10 text-emerald-400 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-400/10">
                          <Music size={24} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-lg font-display font-black uppercase tracking-tight">{res.file}</p>
                          <p className="text-[10px] text-emerald-400/60 font-black uppercase tracking-widest">
                            {res.tracksExtracted ? `${res.tracksExtracted} tracks extracted` : 'Neural audio registered'}
                          </p>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 size={20} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Guidelines */}
          <div className="space-y-8">
            <div className="glass-card p-12 space-y-10 border-white/5 bg-white/[0.02] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-cyan/10 blur-[40px] rounded-full -mr-16 -mt-16" />
              
              <div className="flex items-center gap-4 text-cyber-cyan relative z-10">
                <div className="w-10 h-10 rounded-xl bg-cyber-cyan/10 flex items-center justify-center">
                  <AlertCircle size={20} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em]">Neural Protocols</h3>
              </div>
              
              <div className="space-y-10 relative z-10">
                {[
                  { title: 'Audio Files', desc: 'WAV or MP3 files will be registered as tracks automatically with neural metadata extraction.' },
                  { title: 'Metadata Documents', desc: 'Upload PDFs or images of your label copy for AI-driven extraction and validation.' },
                  { title: 'Bulk Limit', desc: 'Up to 10 files per migration session to ensure neural integrity.' },
                ].map((item, i) => (
                  <div key={i} className="space-y-3 group">
                    <div className="flex items-center gap-3 text-cyber-cyan">
                      <div className="w-6 h-6 rounded-full bg-cyber-cyan/10 flex items-center justify-center group-hover:bg-cyber-cyan group-hover:text-ink transition-all">
                        <Zap size={12} />
                      </div>
                      <span className="text-sm font-black uppercase tracking-tight italic">{item.title}</span>
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed pl-9">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-6 relative z-10">
                <div className="p-8 bg-cyber-cyan/5 rounded-[32px] border border-cyber-cyan/10 space-y-4">
                  <p className="text-[10px] font-black text-cyber-cyan uppercase tracking-widest">AI Status</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Neural Engine</span>
                    <span className="text-xs text-cyber-cyan font-black">ONLINE</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-cyber-cyan animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogMigration;

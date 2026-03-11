import React, { useState } from 'react';
import { bulkUploadFiles } from '../services/api';
import { motion } from 'motion/react';
import { Upload, FileText, CheckCircle2, Loader2, AlertCircle, Music, Database } from 'lucide-react';
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
      toast.success('Migración completada con éxito');
      setFiles([]);
    } catch (err: any) {
      toast.error('Error en la migración: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl lg:text-7xl font-display font-black tracking-tighter uppercase leading-none">
            Catalog <br />
            <span className="text-cyber-cyan">Migration</span>
          </h1>
          <p className="text-white/40 font-medium tracking-wide max-w-xl mx-auto">
            Bulk upload your music catalog. Our AI extracts metadata from PDFs, images, and audio files automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-10 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-cyber-cyan">
                  <Database size={20} />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em]">Upload Files</h3>
                </div>
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">PDF, Audio, Images</span>
              </div>

              <div 
                className="border-2 border-dashed border-white/10 rounded-[2rem] p-16 text-center space-y-6 hover:border-cyber-cyan/40 transition-colors cursor-pointer relative"
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
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
                  <Upload size={32} />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-bold">Drag & drop files here</p>
                  <p className="text-sm text-white/40">or click to browse your computer</p>
                </div>
              </div>

              {files.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-widest text-white/40">Selected Files ({files.length})</h4>
                    <button onClick={() => setFiles([])} className="text-[10px] font-black uppercase text-neon-pink">Clear All</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {files.map((file, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                        <FileText size={16} className="text-white/20" />
                        <span className="text-xs font-bold truncate flex-1">{file.name}</span>
                        <span className="text-[10px] text-white/20">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full py-6 bg-cyber-cyan text-ink rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-cyber-cyan/20 hover:shadow-cyber-cyan/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                  >
                    {uploading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                    <span>{uploading ? 'Processing Catalog...' : 'Start Migration'}</span>
                  </button>
                </div>
              )}
            </div>

            {results.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-10 space-y-8"
              >
                <h3 className="text-xl font-display font-black uppercase tracking-tight">Migration Results</h3>
                <div className="space-y-4">
                  {results.map((res, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-cyber-cyan/10 text-cyber-cyan rounded-xl flex items-center justify-center">
                          <Music size={16} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold">{res.file}</p>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest">
                            {res.tracksExtracted ? `${res.tracksExtracted} tracks extracted` : 'Audio registered'}
                          </p>
                        </div>
                      </div>
                      <CheckCircle2 size={20} className="text-emerald-400" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Guidelines */}
          <div className="space-y-8">
            <div className="glass-card p-10 space-y-8">
              <div className="flex items-center gap-3 text-cyber-cyan">
                <AlertCircle size={20} />
                <h3 className="text-xs font-black uppercase tracking-[0.2em]">Guidelines</h3>
              </div>
              <div className="space-y-6">
                {[
                  { title: 'Audio Files', desc: 'WAV or MP3 files will be registered as tracks automatically.' },
                  { title: 'Metadata Documents', desc: 'Upload PDFs or images of your label copy for AI extraction.' },
                  { title: 'Bulk Limit', desc: 'Up to 10 files per migration session.' },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <p className="text-sm font-bold uppercase tracking-tight">{item.title}</p>
                    <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogMigration;

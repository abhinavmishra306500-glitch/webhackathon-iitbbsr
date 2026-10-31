import React, { useState } from 'react';
import { Database, UploadCloud, CheckCircle2, FileText, RefreshCw } from 'lucide-react';

export const DatasetManagementPage: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const datasets = [
    { name: 'cit_rooms_master.json', type: 'JSON Schema', size: '48 KB', records: '27 Rooms (Block A, B, C, Central)', lastUpdated: 'Today 10:14 AM', status: 'Validated' },
    { name: 'faculty_directory.csv', type: 'CSV Document', size: '112 KB', records: '40 Faculty Profiles & Specializations', lastUpdated: 'Yesterday', status: 'Validated' },
    { name: 'active_semester_curriculum.json', type: 'JSON Schema', size: '240 KB', records: '189 Class Sessions & Lab Credits', lastUpdated: 'Oct 28, 2026', status: 'Validated' },
    { name: 'student_batch_groups.csv', type: 'CSV Document', size: '36 KB', records: '14 Student Section Cohorts', lastUpdated: 'Oct 25, 2026', status: 'Validated' },
  ];

  const handleUploadSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      }, 1200);
    }
  };

  return (
    <div className="space-y-4 pb-8 dashboard-anim-item">
      {/* Header Bar */}
      <div className="liquid-glass-navbar px-4 sm:px-6 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-2 text-white flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-display">Dataset Management</h2>
            <p className="text-xs text-slate-300">Upload, validate, and manage institutional datasets for CIT Active Directory</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-semibold hover:bg-cyan-500/30 flex items-center gap-1.5 transition-colors">
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Re-Index Schema</span>
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="p-6 rounded-2xl liquid-glass-card border-dashed border-cyan-400/50 text-center relative overflow-hidden group">
        <input
          type="file"
          accept=".csv,.json"
          onChange={handleUploadSimulate}
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
        />
        <div className="space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {isUploading ? 'Validating CIT Schema Integrity...' : 'Upload Institutional Dataset'}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Drag and drop your JSON or CSV file here, or click to browse
            </p>
          </div>
          {uploadSuccess && (
            <p className="text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Dataset verified and synchronized successfully!</span>
            </p>
          )}
        </div>
      </div>

      {/* Datasets Table */}
      <div className="liquid-glass-card rounded-2xl p-1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-slate-300 uppercase font-semibold text-[10px] tracking-wider bg-white/5">
              <tr>
                <th className="py-3 px-4">Dataset Filename</th>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4">Records & Content</th>
                <th className="py-3 px-4">File Size</th>
                <th className="py-3 px-4">Last Verified</th>
                <th className="py-3 px-4 text-right">Integrity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {datasets.map((d, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-cyan-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{d.name}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{d.type}</td>
                  <td className="py-3 px-4 text-slate-200">{d.records}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{d.size}</td>
                  <td className="py-3 px-4 text-slate-400">{d.lastUpdated}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

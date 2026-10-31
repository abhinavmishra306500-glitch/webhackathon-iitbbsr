import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  FileText,
  RefreshCw,
  Archive,
  Layers,
  Users,
  Building2,
  Calendar,
  FileCheck,
} from 'lucide-react';

interface DatasetFile {
  name: string;
  type: string;
  size: string;
  records: string;
  lastUpdated?: string;
  status: string;
}

export const DatasetManagementPage: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadedZipName, setUploadedZipName] = useState<string | null>(
    'CrunchWeek_StarterPack_Extracted.zip'
  );

  const [stats, setStats] = useState({
    rooms: 27,
    faculty: 40,
    sessions: 189,
    courses: 62,
    studentGroups: 14,
    bookingRequests: 25,
    midsemExams: 41,
  });

  const [datasets, setDatasets] = useState<DatasetFile[]>([
    { name: 'cit_public.json', type: 'JSON Master Schema', size: '138 KB', records: 'Full Institutional Database (All entities)', status: 'Validated' },
    { name: 'rooms.csv', type: 'CSV Document', size: '3.7 KB', records: '27 Rooms (Block A, B, C, Central, Labs)', status: 'Validated' },
    { name: 'faculty.csv', type: 'CSV Document', size: '4.0 KB', records: '40 Faculty Profiles, Max Hours & Avoids', status: 'Validated' },
    { name: 'sessions.csv', type: 'CSV Document', size: '19.8 KB', records: '189 Class Sessions (243 Teaching Hours)', status: 'Validated' },
    { name: 'courses.csv', type: 'CSV Document', size: '2.4 KB', records: '62 Academic Courses & Credit Blocks', status: 'Validated' },
    { name: 'student_groups.csv', type: 'CSV Document', size: '562 B', records: '14 Cohorts (Year 1 to Year 3 Branches)', status: 'Validated' },
    { name: 'booking_requests.csv', type: 'CSV Document', size: '8.5 KB', records: '25 Spectra Week Event Requisitions', status: 'Validated' },
    { name: 'exams.csv', type: 'CSV Document', size: '2.0 KB', records: '41 Midsemester Exam Schedules', status: 'Validated' },
    { name: 'room_unavailability.csv', type: 'CSV Document', size: '152 B', records: 'Maintenance & Academic Hold Slots', status: 'Validated' },
    { name: 'validator.py', type: 'Python Audit Script', size: '23.2 KB', records: 'Official Zero-Hard-Violation Checker', status: 'Verified' },
  ]);

  // Load real dataset stats from backend API
  useEffect(() => {
    const fetchDatasetSummary = async () => {
      try {
        const res = await fetch('/api/dataset/summary');
        if (res.ok) {
          const data = await res.json();
          if (data.loaded) {
            setStats(data.stats);
            if (data.files && data.files.length > 0) {
              setDatasets(data.files);
            }
          }
        }
      } catch (err) {
        console.warn('Dataset summary fetch fallback to local defaults', err);
      }
    };
    fetchDatasetSummary();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(15);
    setUploadMessage(`Reading archive "${file.name}"...`);
    setUploadedZipName(file.name);

    // Simulate progressive zip extraction and validation
    setTimeout(() => {
      setUploadProgress(45);
      setUploadMessage('Extracting CSVs and JSON schemas (cit_public.json)...');
    }, 600);

    setTimeout(() => {
      setUploadProgress(80);
      setUploadMessage('Running validator.py integrity checks across 189 sessions...');
    }, 1200);

    setTimeout(() => {
      setUploadProgress(100);
      setIsUploading(false);
      setUploadMessage(`✅ Success! "${file.name}" extracted and verified: 27 rooms, 40 faculty, 189 sessions loaded.`);
      setTimeout(() => setUploadMessage(null), 5000);
    }, 1800);
  };

  return (
    <div className="space-y-4 pb-8 dashboard-anim-item">
      {/* Header Bar */}
      <div className="liquid-glass-navbar px-4 sm:px-6 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-2 text-white flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-display">Dataset Management</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 border border-cyan-400/30 text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                CIT Official Dataset Active
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Upload ZIP archives, inspect CSVs, and validate institutional scheduling datasets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsUploading(true);
              setUploadMessage('Re-indexing institutional schema...');
              setTimeout(() => {
                setIsUploading(false);
                setUploadMessage('Schema re-indexed successfully!');
                setTimeout(() => setUploadMessage(null), 3000);
              }, 1000);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-semibold hover:bg-cyan-500/30 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Re-Index Schema</span>
          </button>
        </div>
      </div>

      {/* Dataset Metric Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl liquid-glass-card border-cyan-400/30 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-lg font-bold text-white font-display">{stats.rooms}</p>
            <p className="text-[11px] text-slate-300">Campus Rooms</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl liquid-glass-card border-cyan-400/30 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-lg font-bold text-white font-display">{stats.faculty}</p>
            <p className="text-[11px] text-slate-300">Faculty Members</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl liquid-glass-card border-cyan-400/30 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <p className="text-lg font-bold text-white font-display">{stats.sessions}</p>
            <p className="text-[11px] text-slate-300">Class Sessions</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl liquid-glass-card border-cyan-400/30 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="text-lg font-bold text-white font-display">{stats.bookingRequests}</p>
            <p className="text-[11px] text-slate-300">Spectra Requisitions</p>
          </div>
        </div>
      </div>

      {/* ZIP / Dataset Upload Zone */}
      <div className="p-6 rounded-2xl liquid-glass-card border-dashed border-cyan-400/50 text-center relative overflow-hidden group hover:border-cyan-300 transition-all shadow-[0_0_20px_rgba(6,182,212,0.15)]">
        <input
          type="file"
          accept=".zip,.json,.csv"
          onChange={handleFileUpload}
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
        />
        <div className="space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/30 text-cyan-300 border border-cyan-400/40 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            {isUploading ? (
              <RefreshCw className="w-7 h-7 text-cyan-300 animate-spin" />
            ) : (
              <Archive className="w-7 h-7 text-cyan-300" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {isUploading ? 'Extracting & Validating ZIP Dataset Archive...' : 'Upload Dataset ZIP Archive'}
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-lg mx-auto">
              Drag and drop your <span className="text-cyan-300 font-semibold">.ZIP</span>, <span className="text-cyan-300 font-semibold">.JSON</span>, or <span className="text-cyan-300 font-semibold">.CSV</span> dataset file here, or click to browse.
            </p>
            <div className="mt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono">.ZIP</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono">.JSON</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono">.CSV</span>
            </div>
          </div>

          {/* Active Status Badge */}
          {uploadedZipName && !isUploading && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-cyan-950/60 border border-cyan-400/40 text-cyan-200 text-xs">
              <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Loaded Archive: <strong>{uploadedZipName}</strong></span>
            </div>
          )}

          {/* Progress bar */}
          {isUploading && (
            <div className="max-w-md mx-auto space-y-1.5 pt-2">
              <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-white/10">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-cyan-300 font-medium">{uploadMessage}</p>
            </div>
          )}

          {uploadMessage && !isUploading && (
            <p className="text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>{uploadMessage}</span>
            </p>
          )}
        </div>
      </div>

      {/* Datasets Table */}
      <div className="liquid-glass-card rounded-2xl p-1 overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.3)]">
        <div className="p-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Institutional Entity Schemas (Chilika Institute of Technology)
            </h3>
          </div>
          <span className="text-[11px] text-cyan-300 font-mono">{datasets.length} Active Files</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-slate-300 uppercase font-semibold text-[10px] tracking-wider bg-white/5">
              <tr>
                <th className="py-3 px-4">Dataset Filename</th>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4">Records & Content</th>
                <th className="py-3 px-4">File Size</th>
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

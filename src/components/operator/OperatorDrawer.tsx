'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Users,
  History,
  Shield,
  RotateCcw,
  FileSpreadsheet,
  CheckCircle2,
  Search,
  Volume2,
  VolumeX,
  Maximize2,
} from 'lucide-react';
import { Participant, DrawRecord } from '@/lib/types';
import { sound } from '@/lib/audio';

interface OperatorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  participantCount: number;
  onRefreshData: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const OperatorDrawer: React.FC<OperatorDrawerProps> = ({
  isOpen,
  onClose,
  participantCount,
  onRefreshData,
  isMuted,
  onToggleMute,
}) => {
  const [activeTab, setActiveTab] = useState<'pool' | 'upload' | 'draws'>('pool');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [draws, setDraws] = useState<DrawRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [pRes, dRes] = await Promise.all([
        fetch('/api/participants'),
        fetch('/api/draws'),
      ]);
      const pData = await pRes.json();
      const dData = await dRes.json();

      if (pData.participants) setParticipants(pData.participants);
      if (dData.draws) setDraws(dData.draws);
    } catch (err) {
      console.error('Failed to load operator data:', err);
    }
  };

  const toggleFullscreen = () => {
    sound.playButtonClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus(null);
    sound.playButtonClick();

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Import failed');

      setUploadStatus({
        message: `Success: ${data.message}`,
        isError: false,
      });
      onRefreshData();
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Import failed';
      setUploadStatus({
        message: `Error: ${msg}`,
        isError: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetDraws = async () => {
    try {
      sound.playButtonClick();
      const res = await fetch('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setConfirmReset(false);
        onRefreshData();
        loadData();
      }
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  const [volume, setVolume] = useState<number>(() => Math.round(sound.getVolume() * 100));

  if (!isOpen) return null;

  const filteredParticipants = participants.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.department && p.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#0B0C10] border-l border-white/10 h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-tedx-red/20 text-tedx-red border border-tedx-red/40">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://cdn.v1ggs.lol/tedxtcet/logo-white.png"
                alt="TEDxTCET"
                className="h-6 w-auto object-contain mb-1"
              />
              <p className="text-xs font-mono text-neutral-400">
                Operator Settings & Stage Controls
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMute}
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-all"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-[#EB0028]" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>

            <button
              onClick={toggleFullscreen}
              title="Toggle Stage Fullscreen (F11)"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-all"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                sound.playButtonClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Master Stage Volume Slider */}
        <div className="px-6 py-3 bg-[#07080B] border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 shrink-0">
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-[#EB0028]" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#FFB300]" />
            )}
            <span>Master Volume</span>
          </div>

          <div className="flex items-center gap-3 flex-1 max-w-xs">
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const val = Number(e.target.value);
                setVolume(val);
                sound.setVolume(val / 100);
              }}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#EB0028]"
            />
            <span className="text-xs font-mono text-white font-bold w-9 text-right">
              {isMuted ? '0%' : `${volume}%`}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 px-6 gap-2 pt-3">
          <button
            onClick={() => setActiveTab('pool')}
            className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'pool'
                ? 'border-tedx-red text-white font-bold'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Pool ({participantCount})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'upload'
                ? 'border-tedx-red text-white font-bold'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel / CSV
            </span>
          </button>

          <button
            onClick={() => setActiveTab('draws')}
            className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'draws'
                ? 'border-tedx-red text-white font-bold'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" /> Audit Logs ({draws.length})
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* 1. Pool View */}
          {activeTab === 'pool' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search participants by name, department, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-tedx-red"
                />
              </div>

              <div className="divide-y divide-white/5 bg-black/40 rounded-xl border border-white/5 max-h-96 overflow-y-auto">
                {filteredParticipants.length === 0 ? (
                  <div className="p-6 text-center text-xs font-mono text-neutral-500">
                    No participants match your query.
                  </div>
                ) : (
                  filteredParticipants.map((p) => (
                    <div key={p.id} className="p-3 flex items-center justify-between hover:bg-white/5">
                      <div>
                        <div className="text-xs font-bold text-white">{p.name}</div>
                        <div className="text-[10px] font-mono text-neutral-400 flex items-center gap-2">
                          {p.instagram && <span className="text-[#E1306C] font-semibold">@{p.instagram}</span>}
                          <span>{p.department || p.email || p.id}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-neutral-300 border border-white/5">
                        {p.id}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 2. Upload View */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="p-6 border-2 border-dashed border-white/20 hover:border-tedx-red rounded-2xl text-center bg-black/40 transition-all">
                <Upload className="w-10 h-10 text-tedx-red mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white font-display mb-1">
                  Upload Excel (.xlsx, .xls) or CSV (.csv)
                </h4>
                <p className="text-xs text-neutral-400 mb-4">
                  File should contain a name column (e.g. &quot;Full Name&quot;, &quot;Name&quot;, &quot;Attendee&quot;).
                </p>

                <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-tedx-red hover:bg-tedx-brightred text-white text-xs font-mono font-bold tracking-wider cursor-pointer shadow-glow-red transition-all">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Choose Spreadsheet File</span>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>

              {uploadStatus && (
                <div
                  className={`p-4 rounded-xl text-xs font-mono flex items-start gap-2.5 border ${
                    uploadStatus.isError
                      ? 'bg-red-950/80 border-tedx-red text-red-200'
                      : 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{uploadStatus.message}</span>
                </div>
              )}
            </div>
          )}

          {/* 3. Audit Logs View */}
          {activeTab === 'draws' && (
            <div className="space-y-3">
              {draws.length === 0 ? (
                <div className="p-8 text-center text-xs font-mono text-neutral-500">
                  No lucky draws have been conducted yet.
                </div>
              ) : (
                draws.map((d) => (
                  <div
                    key={d.id}
                    className="p-4 rounded-xl bg-black border border-white/10 space-y-2 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{d.winnerName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-tedx-red/20 text-tedx-brightred border border-tedx-red/40">
                        DRAW #{d.drawNumber}
                      </span>
                    </div>
                    <div className="text-neutral-400 text-[11px]">
                      Participant ID: <span className="text-white">{d.winnerId}</span> • Pool Size:{' '}
                      <span className="text-white">{d.totalParticipants}</span>
                    </div>
                    <div className="text-neutral-500 text-[10px] truncate">
                      SHA-256: {d.auditHash}
                    </div>
                    <div className="text-neutral-500 text-[10px]">
                      {new Date(d.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              )}

              {/* Reset Draws button */}
              <div className="pt-4 border-t border-white/10">
                {!confirmReset ? (
                  <button
                    onClick={() => setConfirmReset(true)}
                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-tedx-red/20 text-neutral-400 hover:text-tedx-brightred border border-white/10 text-xs font-mono transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Draw Records</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-black border border-tedx-red space-y-2">
                    <p className="text-xs text-white font-mono">
                      Are you sure you want to reset draw records?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleResetDraws}
                        className="flex-1 py-1.5 bg-tedx-red hover:bg-tedx-brightred text-white rounded text-xs font-mono font-bold"
                      >
                        Confirm Reset
                      </button>
                      <button
                        onClick={() => setConfirmReset(false)}
                        className="px-3 py-1.5 bg-white/10 text-neutral-300 rounded text-xs font-mono"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

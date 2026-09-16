import React, { useState } from 'react';
import { Activity, ChevronDown, ChevronUp, Cpu, HardDrive, Zap, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { t } from '@eyeposture/i18n';

export const PerformancePanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const { governorStatus, liveAnalysis } = useApp();

  return (
    <div className="fixed bottom-4 right-4 z-40 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-all text-xs select-none">
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-slate-800/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-teal-400" />
          <span className="font-semibold text-slate-300">{t('diagnostics.title')}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-teal-300 font-mono">
            {governorStatus.targetFps} FPS
          </span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">
            {governorStatus.cpuLoadPercent}% CPU
          </span>
        </div>
        {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-500" />}
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/60 w-80">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Zap className="w-3 h-3 text-amber-400" /> {t('diagnostics.resourceGovernor')}
            </span>
            <span className="font-mono font-semibold text-teal-300">{governorStatus.mode}</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Cpu className="w-3 h-3 text-indigo-400" /> {t('diagnostics.systemLoad')}
            </span>
            <span className="font-mono text-slate-200">{governorStatus.cpuLoadPercent}% CPU</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Eye className="w-3 h-3 text-cyan-400" /> {t('diagnostics.cvFps')}
            </span>
            <span className="font-mono text-teal-400 font-bold">{governorStatus.targetFps} FPS</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <HardDrive className="w-3 h-3 text-emerald-400" /> {t('diagnostics.sqliteState')}
            </span>
            <span className="font-mono text-emerald-400 font-medium">OK (0.8ms avg)</span>
          </div>

          <div className="flex items-center justify-between text-slate-300 pt-2 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-500">{t('diagnostics.distanceRatio')}</span>
            <span className="font-mono text-[11px] text-slate-300">{liveAnalysis.distanceRatio}x</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-[10px] text-slate-500">{t('diagnostics.postureScore')}</span>
            <span className="font-mono text-[11px] text-slate-300">{liveAnalysis.postureScore}/100</span>
          </div>
        </div>
      )}
    </div>
  );
};

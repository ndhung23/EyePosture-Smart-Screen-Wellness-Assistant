import React, { useState } from 'react';
import { Users, UserPlus, Shield, Check, Trash2, Baby, User } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { t } from '@eyeposture/i18n';

export const ProfilesPage: React.FC = () => {
  const { profiles, activeProfile, switchProfile, createProfile, deleteProfile } = useApp();

  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [isChild, setIsChild] = useState<boolean>(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createProfile(newName.trim(), isChild);
    setNewName('');
    setIsChild(false);
    setIsCreating(false);
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-100">{t('profiles.title')}</h2>
          <p className="text-sm text-slate-400 mt-1">
            {t('profiles.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-teal text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/25 active:scale-95 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('profiles.createProfile')}</span>
        </button>
      </div>

      {/* Profile Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {profiles.map((profile) => {
          const isActive = profile.id === activeProfile?.id;
          return (
            <div
              key={profile.id}
              className={`glass-card p-6 flex flex-col justify-between space-y-6 relative transition-all ${
                isActive ? 'border-teal-500/50 bg-slate-900/90 shadow-xl shadow-teal-500/10' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      profile.isChild
                        ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                        : 'bg-teal-500/15 border border-teal-500/30 text-teal-300'
                    }`}
                  >
                    {profile.isChild ? <Baby className="w-6 h-6" /> : <User className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base text-slate-100">{profile.name}</h4>
                    <span className="text-[11px] font-medium text-slate-400">
                      {profile.isChild ? t('common.childProfile') : t('common.standardProfile')}
                    </span>
                  </div>
                </div>

                {isActive && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
                    <Check className="w-3 h-3" /> {t('common.active')}
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs text-slate-400 border-t border-slate-800/80 pt-4">
                <div className="flex justify-between">
                  <span>{t('profiles.baselineCalibrated')}</span>
                  <span className="text-slate-200">{t('profiles.calibrated')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('profiles.parentalLimits')}</span>
                  <span className="text-slate-200">
                    {profile.isChild ? t('profiles.strictLimit') : t('profiles.standardLimit')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                {!isActive ? (
                  <button
                    onClick={() => switchProfile(profile.id)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all"
                  >
                    {t('profiles.selectProfile')}
                  </button>
                ) : (
                  <div className="flex-1 py-2 text-center text-xs font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 rounded-xl">
                    {t('profiles.currentlySelected')}
                  </div>
                )}

                {profiles.length > 1 && (
                  <button
                    onClick={() => deleteProfile(profile.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800/60 transition-colors"
                    title={t('profiles.deleteProfileTooltip')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Profile Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn">
          <form
            onSubmit={handleCreate}
            className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl space-y-6"
          >
            <div>
              <h3 className="font-display font-bold text-xl text-slate-100">{t('profiles.createProfile')}</h3>
              <p className="text-xs text-slate-400 mt-1">{t('profiles.modalSubtitle')}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">{t('profiles.profileNameLabel')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('profiles.namePlaceholder')}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChild}
                  onChange={(e) => setIsChild(e.target.checked)}
                  className="mt-0.5 rounded bg-slate-700 border-slate-600 text-teal-500 focus:ring-0"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">{t('common.childProfile')}</span>
                  <span className="text-[11px] text-slate-400 leading-relaxed block mt-0.5">
                    {t('profiles.childProfile')}
                  </span>
                </div>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl gradient-teal text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/25"
              >
                {t('profiles.createProfile')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Target, CheckCircle, ArrowRight, RotateCw, X, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { t } from '@eyeposture/i18n';

interface CalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalibrationModal: React.FC<CalibrationModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<number>(1);
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  const { liveAnalysis } = useApp();

  if (!isOpen) return null;

  const handleStartMeasuring = () => {
    setIsMeasuring(true);
    setStep(4);
    setTimeout(() => {
      setIsMeasuring(false);
      setStep(5);
    }, 2500);
  };

  const handleFinish = () => {
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-slate-100">{t('calibration.wizardTitle')}</h3>
            <p className="text-xs text-slate-400">Personalize your ergonomic distance & posture baseline</p>
          </div>
        </div>

        {/* Step Progression Bar */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-teal-400' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[160px] flex flex-col justify-center">
          {step === 1 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-200">{t('calibration.step1')}</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Adjust your chair and desk height so your back is supported and shoulders are relaxed.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-200">{t('calibration.step2')}</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Position your eyes roughly arm's length (about 50 to 70 centimeters) away from your display.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-200">{t('calibration.step3')}</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Keep your gaze directed comfortably near the upper-third of the screen.
              </p>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-4 space-y-4">
              <RotateCw className="w-8 h-8 text-teal-400 animate-spin mx-auto" />
              <div>
                <h4 className="font-semibold text-slate-200">{t('calibration.calibrating')}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Recording distance ratio ({liveAnalysis.distanceRatio}x) and facial center...
                </p>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="text-center py-4 space-y-3">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
              <div>
                <h4 className="font-bold text-slate-100 text-lg">{t('calibration.step5')}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Your personalized comfort metrics have been saved locally.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            <span>Processed 100% locally</span>
          </div>

          <div className="flex items-center gap-3">
            {step < 3 && (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-all"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleStartMeasuring}
                className="px-5 py-2.5 rounded-xl gradient-teal text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-teal-500/25 transition-all active:scale-95"
              >
                <span>{t('calibration.calibrateButton')}</span>
              </button>
            )}

            {step === 5 && (
              <button
                onClick={handleFinish}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

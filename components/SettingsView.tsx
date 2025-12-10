import React from 'react';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { AppSettings, RewriteLevel, WritingStyle } from '../types';
import { WRITING_STYLES } from '../constants';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdateSettings, onBack }) => {
  return (
    <div className="min-h-screen bg-[#FAF9F6] p-4 pb-24">
      <div className="flex items-center space-x-4 mb-8 pt-2">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="text-charcoal" />
        </button>
        <h1 className="text-2xl font-serif font-bold text-charcoal">Configuration</h1>
      </div>

      <div className="space-y-8">
        {/* Rewrite Level */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Rewrite Level</h2>
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
            {Object.values(RewriteLevel).map((level) => (
              <button
                key={level}
                onClick={() => onUpdateSettings({ ...settings, rewriteLevel: level })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  settings.rewriteLevel === level
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-500 hover:text-charcoal'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </section>

        {/* Style Selector */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Persona & Style</h2>
          <div className="grid grid-cols-1 gap-4">
            {WRITING_STYLES.map((style) => {
              const isSelected = settings.selectedStyleId === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => onUpdateSettings({ ...settings, selectedStyleId: style.id })}
                  className={`relative p-5 text-left bg-white rounded-xl border-2 transition-all duration-200 group ${
                    isSelected
                      ? 'border-primary shadow-lg ring-1 ring-primary/20'
                      : 'border-transparent shadow-sm hover:border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-serif font-bold text-lg ${isSelected ? 'text-primary' : 'text-charcoal'}`}>
                      {style.name}
                    </h3>
                    {isSelected && (
                      <div className="bg-primary text-white p-1 rounded-full">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-700">
                    {style.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Language */}
        <section>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Output Language</h2>
            <select 
                value={settings.language}
                onChange={(e) => onUpdateSettings({...settings, language: e.target.value})}
                className="w-full p-4 bg-white rounded-xl border-transparent shadow-sm appearance-none outline-none focus:ring-2 focus:ring-primary/20 font-sans text-charcoal"
            >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Japanese">Japanese</option>
            </select>
        </section>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Settings, User, Mic, Upload, Edit3, Search, Hash, Loader2, PlayCircle, ChevronRight, FileText } from 'lucide-react';
import { Note, AppSettings, ProcessingResult } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { RecordingOverlay } from './components/RecordingOverlay';
import { SettingsView } from './components/SettingsView';
import { processAudioNote } from './services/geminiService';

// --- Helper Components ---

const NoteCard: React.FC<{ note: Note; onClick: () => void }> = ({ note, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 flex flex-col gap-3 group"
  >
    <h3 className="font-serif font-bold text-xl text-charcoal leading-tight group-hover:text-primary transition-colors">
      {note.title}
    </h3>
    <p className="font-sans text-gray-600 text-sm line-clamp-3 leading-relaxed">
      {note.content}
    </p>
    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
      <div className="flex gap-2 flex-wrap">
        {note.tags.map(tag => (
          <span key={tag} className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
            #{tag}
          </span>
        ))}
      </div>
      <span className="text-xs text-gray-400 font-mono">
        {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
      </span>
    </div>
  </div>
);

const FAB: React.FC<{ onRecord: () => void; disabled?: boolean }> = ({ onRecord, disabled }) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-40">
    <button disabled={disabled} className="bg-charcoal text-white p-3 rounded-full shadow-lg hover:bg-black transition-transform hover:scale-105 disabled:opacity-50">
      <Upload size={20} />
    </button>
    
    <button 
      onClick={onRecord}
      disabled={disabled}
      className="bg-[#FF5500] text-white p-6 rounded-full shadow-xl shadow-orange-500/30 transition-all hover:scale-110 active:scale-95 disabled:opacity-50 flex items-center justify-center"
    >
      <Mic size={32} />
    </button>

    <button disabled={disabled} className="bg-charcoal text-white p-3 rounded-full shadow-lg hover:bg-black transition-transform hover:scale-105 disabled:opacity-50">
      <Edit3 size={20} />
    </button>
  </div>
);

// --- Main App Component ---

enum ViewState {
  DASHBOARD = 'DASHBOARD',
  SETTINGS = 'SETTINGS',
  RECORDING = 'RECORDING',
  NOTE_DETAIL = 'NOTE_DETAIL',
}

export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [notes, setNotes] = useState<Note[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All Notes');

  // Load from local storage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('audio_scribe_notes');
    const savedSettings = localStorage.getItem('audio_scribe_settings');
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('audio_scribe_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('audio_scribe_settings', JSON.stringify(settings));
  }, [settings]);

  const handleFinishRecording = async (blob: Blob) => {
    setView(ViewState.DASHBOARD);
    setIsProcessing(true);
    
    try {
      const result: ProcessingResult = await processAudioNote(blob, settings);
      
      const newNote: Note = {
        id: crypto.randomUUID(),
        title: result.title,
        content: result.content,
        originalTranscript: result.originalTranscript,
        tags: result.tags,
        createdAt: Date.now(),
        style: settings.selectedStyleId
      };

      setNotes(prev => [newNote, ...prev]);
    } catch (error) {
      alert("Failed to process audio. Please check your API Key and internet connection.");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredNotes = notes.filter(n => {
    const query = searchQuery.toLowerCase();
    return n.title.toLowerCase().includes(query) || 
           n.content.toLowerCase().includes(query) ||
           n.tags.some(t => t.toLowerCase().includes(query));
  });

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#FAF9F6] relative shadow-2xl overflow-hidden">
      
      {/* --- DASHBOARD VIEW --- */}
      {view === ViewState.DASHBOARD && (
        <div className="h-full flex flex-col">
          {/* Header */}
          <header className="px-6 pt-8 pb-4 flex justify-between items-center bg-[#FAF9F6] sticky top-0 z-10">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-serif font-bold">A</div>
               <span className="font-serif font-bold text-xl text-charcoal">AudioScribe</span>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setView(ViewState.SETTINGS)} className="text-gray-500 hover:text-primary transition-colors">
                <Settings size={24} />
              </button>
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                <User size={16} />
              </div>
            </div>
          </header>

          {/* Navigation Pills */}
          <div className="px-6 pb-2 overflow-x-auto no-scrollbar flex gap-3">
            {['All Notes', 'AudioPen', 'Drafts', 'Favorites'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab 
                    ? 'bg-orange-100 text-primary' 
                    : 'bg-transparent text-gray-500 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="px-6 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search your notes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white pl-10 pr-4 py-3 rounded-xl shadow-sm border-transparent focus:ring-2 focus:ring-primary/20 outline-none text-sm placeholder:text-gray-400 text-charcoal"
              />
            </div>
          </div>

          {/* Processing State */}
          {isProcessing && (
            <div className="px-6 py-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 flex items-center gap-4 animate-pulse">
                <Loader2 className="animate-spin text-primary" size={24} />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          )}

          {/* Notes Feed */}
          <div className="flex-1 px-6 pb-32 overflow-y-auto space-y-4 no-scrollbar">
            {filteredNotes.length === 0 && !isProcessing ? (
              <div className="text-center py-20 text-gray-400">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Mic size={24} className="opacity-50" />
                </div>
                <p className="font-serif">No notes yet.</p>
                <p className="text-sm">Tap the microphone to start.</p>
              </div>
            ) : (
              filteredNotes.map(note => (
                <NoteCard 
                  key={note.id} 
                  note={note} 
                  onClick={() => {
                    setSelectedNote(note);
                    setView(ViewState.NOTE_DETAIL);
                  }} 
                />
              ))
            )}
          </div>

          <FAB onRecord={() => setView(ViewState.RECORDING)} disabled={isProcessing} />
        </div>
      )}

      {/* --- RECORDING VIEW --- */}
      {view === ViewState.RECORDING && (
        <RecordingOverlay 
          settings={settings}
          onClose={() => setView(ViewState.DASHBOARD)}
          onFinish={handleFinishRecording}
        />
      )}

      {/* --- SETTINGS VIEW --- */}
      {view === ViewState.SETTINGS && (
        <SettingsView 
          settings={settings} 
          onUpdateSettings={setSettings} 
          onBack={() => setView(ViewState.DASHBOARD)} 
        />
      )}

      {/* --- NOTE DETAIL VIEW --- */}
      {view === ViewState.NOTE_DETAIL && selectedNote && (
        <div className="min-h-screen bg-white flex flex-col">
          <div className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-sm z-10 border-b border-gray-100">
             <button onClick={() => setView(ViewState.DASHBOARD)} className="p-2 -ml-2 hover:bg-gray-50 rounded-full text-charcoal">
               <ChevronRight size={24} className="rotate-180" />
             </button>
             <div className="flex gap-2">
                <button className="p-2 text-gray-500 hover:text-primary"><Upload size={20}/></button>
                <button className="p-2 text-gray-500 hover:text-primary"><Hash size={20}/></button>
             </div>
          </div>

          <div className="px-6 py-6 overflow-y-auto pb-24">
            <h1 className="font-serif text-3xl font-bold text-charcoal mb-6 leading-tight">
              {selectedNote.title}
            </h1>
            
            <div className="flex gap-2 mb-8">
               {selectedNote.tags.map(t => (
                 <span key={t} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium uppercase tracking-wide">
                   {t}
                 </span>
               ))}
            </div>

            <div className="prose prose-orange prose-lg">
              <p className="font-sans text-gray-800 leading-relaxed whitespace-pre-wrap">
                {selectedNote.content}
              </p>
            </div>

            {selectedNote.originalTranscript && (
              <div className="mt-12 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-4 text-gray-400">
                  <FileText size={16} />
                  <span className="text-sm font-bold uppercase tracking-wider">Original Transcript</span>
                </div>
                <p className="text-gray-500 text-sm italic leading-relaxed">
                  "{selectedNote.originalTranscript}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

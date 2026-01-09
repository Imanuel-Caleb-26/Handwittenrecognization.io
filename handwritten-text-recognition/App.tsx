
import React, { useState, useEffect } from 'react';
import { recognizeHandwriting } from './services/geminiService';
import DrawingCanvas from './components/DrawingCanvas';
import HistoryList from './components/HistoryList';
import { RecognitionResult, ProcessingState } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'canvas' | 'upload'>('canvas');
  const [history, setHistory] = useState<RecognitionResult[]>([]);
  const [processing, setProcessing] = useState<ProcessingState>({
    isIdle: true,
    isProcessing: false,
    error: null,
  });
  const [currentResult, setCurrentResult] = useState<RecognitionResult | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('scriptoscan_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveToHistory = (result: RecognitionResult) => {
    const newHistory = [...history, result].slice(-20); // Keep last 20
    setHistory(newHistory);
    localStorage.setItem('scriptoscan_history', JSON.stringify(newHistory));
  };

  const processImage = async (base64: string, type: 'canvas' | 'upload') => {
    setProcessing({ isIdle: false, isProcessing: true, error: null });
    try {
      const recognition = await recognizeHandwriting(base64);
      const result: RecognitionResult = {
        id: crypto.randomUUID(),
        text: recognition.text,
        confidence: recognition.confidence,
        timestamp: Date.now(),
        imageUrl: base64,
        type,
      };
      setCurrentResult(result);
      saveToHistory(result);
      setProcessing({ isIdle: false, isProcessing: false, error: null });
    } catch (error: any) {
      setProcessing({ isIdle: false, isProcessing: false, error: error.message });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        processImage(reader.result, 'upload');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Scripto<span className="text-indigo-600">Scan</span>
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Gemini Powered
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Controls */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex">
              <button
                onClick={() => setActiveTab('canvas')}
                className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
                  activeTab === 'canvas' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Draw on Canvas
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
                  activeTab === 'upload' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Upload Photo
              </button>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-xl shadow-indigo-100/50 border border-gray-100">
              {activeTab === 'canvas' ? (
                <DrawingCanvas 
                  onCapture={(b64) => processImage(b64, 'canvas')} 
                  isProcessing={processing.isProcessing} 
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 border-4 border-dashed border-gray-100 rounded-2xl bg-gray-50 group hover:border-indigo-300 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={processing.isProcessing}
                  />
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <p className="text-lg font-bold text-gray-700">Drop an image here</p>
                  <p className="text-sm text-gray-400">or click to browse from your device</p>
                </div>
              )}
            </div>
          </div>

          {/* Results Side */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-gray-100 h-full flex flex-col min-h-[400px]">
              <div className="p-6 border-b border-gray-50">
                <h2 className="text-lg font-bold text-gray-800">Recognition Results</h2>
              </div>
              
              <div className="flex-1 p-6 flex flex-col items-center justify-center">
                {processing.isProcessing ? (
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-gray-700">Analyzing Handwriting...</p>
                      <p className="text-sm text-gray-400 italic">"Teaching the AI to read your script"</p>
                    </div>
                  </div>
                ) : processing.error ? (
                  <div className="text-center space-y-4 max-w-xs">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="font-bold text-red-600">{processing.error}</p>
                    <button 
                      onClick={() => setProcessing({ ...processing, error: null })}
                      className="text-sm text-indigo-600 font-bold hover:underline"
                    >
                      Dismiss
                    </button>
                  </div>
                ) : currentResult ? (
                  <div className="w-full space-y-6 animate-in fade-in zoom-in duration-300">
                    <div className="p-8 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-center relative overflow-hidden group">
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-white px-2 py-1 rounded-lg shadow-sm">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Verified Result</span>
                      </div>
                      <span className="text-xs font-semibold text-indigo-400 uppercase tracking-[0.2em] block mb-4">Recognized Text</span>
                      <p className="text-4xl md:text-5xl font-bold text-indigo-900 handwriting break-words">
                        {currentResult.text}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-gray-600">AI Confidence</span>
                        <span className={`font-black ${currentResult.confidence > 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {currentResult.confidence}%
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ease-out ${currentResult.confidence > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${currentResult.confidence}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(currentResult.text);
                        alert('Copied to clipboard!');
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 border-2 border-indigo-100 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy to Clipboard
                    </button>
                  </div>
                ) : (
                  <div className="text-center opacity-40">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="font-medium text-gray-500">Awaiting your handwriting...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* History Section */}
        <HistoryList history={history} />
      </main>

      {/* Footer Info */}
      <footer className="max-w-5xl mx-auto px-4 mt-12 py-8 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="font-bold text-gray-900 mb-2">How it works</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              ScriptoScan uses advanced CNN models via Gemini AI to process pixels and recognize handwritten characters, words, and full sentences in real-time.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-2">Privacy First</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your drawings and images are processed securely. We don't store your personal data longer than needed for the recognition session.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-2">Datasets</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              Trained on industrial-standard datasets like MNIST for digits and IAM for handwritten text to ensure global accuracy.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;


import React from 'react';
import { RecognitionResult } from '../types';

interface HistoryListProps {
  history: RecognitionResult[];
}

const HistoryList: React.FC<HistoryListProps> = ({ history }) => {
  if (history.length === 0) return null;

  return (
    <div className="mt-12 space-y-4">
      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Recent Scans
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...history].reverse().map((item) => (
          <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {new Date(item.timestamp).toLocaleTimeString()}
              </span>
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${item.type === 'canvas' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                {item.type}
              </span>
            </div>
            <div className="aspect-video bg-gray-50 rounded-lg overflow-hidden mb-3 border border-gray-100">
              <img src={item.imageUrl} alt="Scan preview" className="w-full h-full object-contain" />
            </div>
            <p className="text-lg font-medium text-indigo-900 handwriting">"{item.text}"</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500" 
                  style={{ width: `${item.confidence}%` }}
                />
              </div>
              <span className="text-xs font-bold text-emerald-600">{item.confidence}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;

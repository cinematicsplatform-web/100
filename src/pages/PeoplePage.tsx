import React, { useState, useMemo } from 'react';
import { Content } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';

const UserIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
  </svg>
);

interface PeoplePageProps {
  allContent: Content[];
  onPersonClick: (name: string, role: string) => void;
  onSetView: (view: any) => void;
}

const PeoplePage: React.FC<PeoplePageProps> = ({ allContent, onPersonClick, onSetView }) => {
  const [activeTab, setActiveTab] = useState<'actors' | 'directors' | 'writers'>('actors');

  const peopleData = useMemo(() => {
    const actors = new Set<string>();
    const directors = new Set<string>();
    const writers = new Set<string>();

    allContent.forEach(content => {
      content.cast?.forEach(actor => actors.add(actor));
      if (content.director) directors.add(content.director);
      if (content.writer) writers.add(content.writer);
    });

    return {
      actors: Array.from(actors).sort(),
      directors: Array.from(directors).sort(),
      writers: Array.from(writers).sort()
    };
  }, [allContent]);

  const currentList = peopleData[activeTab];

  return (
    <div className="min-h-screen bg-[#141414] text-white pt-24 pb-12 animate-fade-in font-['Cairo']">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-12 space-y-6">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00A7F8] to-blue-600">
            نجوم وصناع الفن
          </h1>
          <div className="flex bg-gray-800/50 p-1.5 rounded-full border border-gray-700 backdrop-blur-sm">
            {[
              { id: 'actors', label: 'الممثلين' },
              { id: 'directors', label: 'المخرجين' },
              { id: 'writers', label: 'الكتاب' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-[#00A7F8] text-white shadow-lg shadow-blue-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {currentList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {currentList.map((name, index) => (
              <div 
                key={index}
                onClick={() => onPersonClick(name, activeTab)}
                className="group cursor-pointer bg-[#1f1f1f] border border-gray-800 hover:border-[#00A7F8] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/10 hover:-translate-y-1"
              >
                <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
                  <UserIcon className="w-1/2 h-1/2 text-gray-600 group-hover:text-[#00A7F8] transition-colors duration-300" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-bold text-gray-200 group-hover:text-white truncate transition-colors text-sm md:text-base">
                    {name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {activeTab === 'actors' ? 'ممثل' : activeTab === 'directors' ? 'مخرج' : 'كاتب'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl">لا توجد بيانات متاحة حالياً لهذه الفئة.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PeoplePage;
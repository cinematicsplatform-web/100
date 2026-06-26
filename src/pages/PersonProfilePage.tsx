
import React, { useMemo } from 'react';
import type { Content, Person, View } from '@/types';
import SEO from '../components/SeoMeta';
import ContentCard from '../components/ContentCard';
import { ChevronRightIcon } from '../components/icons/ChevronRight';

// ✅ Corrected Silhouette Icon: Larger, flat-bottomed, feels part of the card
export const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    <circle cx="12" cy="7" r="5" />
    <path d="M12 13c-5 0-9 2-9 5v6h18v-6c0-3-4-5-9-5z" />
  </svg>
);

interface PersonProfilePageProps {
  name: string;
  allContent: Content[];
  people: Person[];
  onSelectContent: (content: Content) => void;
  onSetView: (view: View) => void;
  onGoBack: (fallbackView: View) => void;
  isRamadanTheme?: boolean;
  isEidTheme?: boolean;
  isCosmicTealTheme?: boolean;
  isNetflixRedTheme?: boolean;
  returnView?: View;
}

const PersonProfilePage: React.FC<PersonProfilePageProps> = ({ 
  name, 
  allContent, 
  people, 
  onSelectContent, 
  onSetView,
  onGoBack,
  isRamadanTheme,
  isEidTheme,
  isCosmicTealTheme,
  isNetflixRedTheme,
  returnView
}) => {
  const person = useMemo(() => people.find(p => p.name === name), [people, name]);
  
  const filmography = useMemo(() => {
    return allContent.filter(c => 
      c.cast?.includes(name) || 
      c.director === name || 
      c.writer === name
    ).sort((a, b) => b.releaseYear - a.releaseYear);
  }, [allContent, name]);

  const accentColor = isRamadanTheme ? 'text-amber-500' : isEidTheme ? 'text-purple-500' : isCosmicTealTheme ? 'text-[#35F18B]' : isNetflixRedTheme ? 'text-[#E50914]' : 'text-[#00A7F8]';

  // Dynamic About Label logic
  const getAboutLabel = () => {
    if (!person) return 'عن الفنان';
    const role = person.role;
    if (role === 'director') return 'عن المخرج';
    if (role === 'writer') return 'عن الكاتب';
    // Use a general artist/actor term since gender isn't explicitly defined in types
    return 'عن الممثل';
  };

  return (
    <div className="min-h-screen bg-[var(--bg-body)] text-white animate-fade-in pb-24">
      <SEO title={name} description={person?.biography || `تصفح أعمال ${name} على سينماتيكس.`} image={person?.image} />
      
      <div className="w-full px-4 md:px-8 py-8 md:py-12">
        <button 
          onClick={(e) => {
            e.preventDefault();
            // Direct navigation using internal state for high reliability
            onGoBack(returnView || 'home');
          }}
          className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
        >
          {/* Correct Back Arrow for RTL: Points Right (Previous) */}
          <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          <span className="font-bold">رجوع</span>
        </button>

        <div className="flex flex-col md:flex-row gap-10 items-start">
          {/* Sidebar: Image + Name + Biography */}
          <div className="w-full md:w-1/4 flex-shrink-0">
            {/* Portrait Image Container - aspect-[2/3] like posters */}
            <div className="aspect-[2/3] rounded-3xl overflow-hidden border-4 border-gray-800 bg-gray-800/80 relative flex flex-col justify-end shadow-2xl">
              {person?.image ? (
                <img 
                  src={person.image} 
                  alt={name} 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 w-full h-full flex items-end justify-center">
                  <UserIcon className="w-full h-full text-gray-700/50" />
                </div>
              )}
            </div>
            
            <div className="mt-6 space-y-4 text-center md:text-right">
              <h1 className="text-3xl md:text-4xl font-black leading-tight">{name}</h1>
              <div className={`text-sm font-bold uppercase tracking-widest ${accentColor}`}>
                {person?.role === 'director' ? 'مخرج' : person?.role === 'writer' ? 'كاتب' : 'ممثل'}
              </div>

              {/* Biography placed directly under the name in the sidebar */}
              {person?.biography && (
                <div className="mt-8 pt-6 border-t border-white/10">
                  <h3 className="text-lg font-bold mb-3 text-gray-200">{getAboutLabel()}</h3>
                  <p className="text-gray-400 leading-relaxed text-justify text-sm md:text-base">
                    {person.biography}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content: Filmography */}
          <div className="flex-1 w-full space-y-12">
            <section>
              {/* ✅ Fixed double bar issue: Removed border-r-4 and pr-4, kept the custom pill bar div */}
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <div className="h-6 md:h-8 w-1.5 bg-[var(--color-accent)] rounded-full"></div>
                الأعمال على المنصة ({filmography.length})
              </h3>
              
              {filmography.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filmography.map(item => (
                    <ContentCard 
                      key={item.id} 
                      content={item} 
                      onSelectContent={onSelectContent} 
                      isLoggedIn={true} 
                      onToggleMyList={() => {}} 
                      isGridItem={true}
                      isRamadanTheme={isRamadanTheme}
                      isEidTheme={isEidTheme}
                      isCosmicTealTheme={isCosmicTealTheme}
                      isNetflixRedTheme={isNetflixRedTheme}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center text-gray-500 bg-black/10 rounded-3xl border-2 border-dashed border-gray-800">
                    <p className="text-lg">لا توجد أعمال مضافة لهذا الفنان حالياً.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonProfilePage;

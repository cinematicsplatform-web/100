import React, { useState, useEffect, useMemo } from 'react';
import { getPeople, savePerson, deletePerson } from '../../firebase';
import type { Person } from '../../types';
import { normalizeText } from '../../utils/textUtils';
import { SearchIcon } from '../icons/SearchIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { CloseIcon } from '../icons/CloseIcon';
import DeleteConfirmationModal from '../DeleteConfirmationModal';

// ✅ Corrected Silhouette Icon: Larger, flat-bottomed, anchored exactly with the frame
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

interface PeopleManagerTabProps {
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const TMDB_API_KEY = 'b8d66e320b334f4d56728d98a7e39697';

const PeopleManagerTab: React.FC<PeopleManagerTabProps> = ({ addToast }) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; person: Person | null }>({
    isOpen: false,
    person: null
  });

  const [tmdbSearchQuery, setTmdbSearchQuery] = useState('');
  const [tmdbResults, setTmdbResults] = useState<any[]>([]);
  const [isSearchingTMDB, setIsSearchingTMDB] = useState(false);

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPeople = async () => {
    setIsLoading(true);
    try {
      const data = await getPeople();
      setPeople(data);
    } catch (e) {
      addToast('فشل تحميل قائمة الفنانين', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPeople = useMemo(() => {
    if (!searchTerm.trim()) return people;
    const normalizedQuery = normalizeText(searchTerm);
    return people.filter(p => p.normalizedName.includes(normalizedQuery));
  }, [people, searchTerm]);

  const handleOpenEdit = (person: Person | null) => {
    setEditingPerson(person);
    setTmdbResults([]);
    setTmdbSearchQuery('');
    setIsModalOpen(true);
  };

  const searchTMDB = async () => {
    if (!tmdbSearchQuery.trim()) return;
    setIsSearchingTMDB(true);
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(tmdbSearchQuery)}&language=ar-SA`);
      const data = await res.json();
      setTmdbResults(data.results || []);
    } catch (e) {
      addToast('خطأ في الاتصال بـ TMDB', 'error');
    } finally {
      setIsSearchingTMDB(false);
    }
  };

  const fetchPersonDetails = async (tmdbId: number) => {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/person/${tmdbId}?api_key=${TMDB_API_KEY}&language=ar-SA`);
      const data = await res.json();
      
      if (!data.biography) {
        const resEn = await fetch(`https://api.themoviedb.org/3/person/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US`);
        const dataEn = await resEn.json();
        data.biography = dataEn.biography;
      }

      setEditingPerson(prev => ({
        id: prev?.id || '',
        name: data.name,
        normalizedName: normalizeText(data.name),
        tmdbId: String(data.id),
        image: data.profile_path ? `https://image.tmdb.org/t/p/w500${data.profile_path}` : prev?.image,
        biography: data.biography,
        role: prev?.role || 'actor',
        birthday: data.birthday,
        placeOfBirth: data.place_of_birth,
        updatedAt: new Date().toISOString()
      }));
      setTmdbResults([]);
    } catch (e) {
      addToast('فشل جلب تفاصيل الفنان', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPerson?.name) return;

    try {
      const personData = {
        ...editingPerson,
        normalizedName: normalizeText(editingPerson.name)
      };
      await savePerson(personData);
      addToast('تم حفظ الملف بنجاح', 'success');
      setIsModalOpen(false);
      fetchPeople();
    } catch (e) {
      addToast('حدث خطأ أثناء الحفظ', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.person) return;
    try {
      await deletePerson(deleteModal.person.id);
      addToast('تم حذف الملف', 'success');
      setDeleteModal({ isOpen: false, person: null });
      fetchPeople();
    } catch (e) {
      addToast('فشل الحذف', 'error');
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1f2937] p-6 rounded-2xl border border-gray-700/50 shadow-lg">
        <div className="relative flex-1 w-full max-w-md">
          <input 
            type="text" 
            placeholder="ابحث عن فنان..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-12 py-3 focus:border-[#00A7F8] focus:ring-1 focus:ring-[#00A7F8] outline-none text-white transition-all"
          />
          <SearchIcon className="absolute right-4 top-3.5 text-gray-500 w-5 h-5" />
        </div>
        <button 
          onClick={() => handleOpenEdit(null)}
          className="bg-gradient-to-r from-[#00A7F8] to-[#00FFB0] text-black font-black px-8 py-3 rounded-xl hover:shadow-[0_0_20px_rgba(0,167,248,0.4)] transition-all transform hover:scale-105"
        >
          + إضافة نجم/صانع
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-gray-500">جاري تحميل القائمة...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {filteredPeople.map(person => (
            <div key={person.id} className="group relative aspect-square bg-[#1f2937] border border-gray-700/50 rounded-2xl overflow-hidden hover:border-[#00A7F8]/50 transition-all flex flex-col justify-end">
              <div className="absolute inset-0 w-full h-full bg-gray-800 flex items-end justify-center overflow-hidden">
                {person.image ? (
                  <img 
                    src={person.image} 
                    alt={person.name} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-end justify-center">
                    <UserIcon className="w-full h-full text-gray-700/50" />
                  </div>
                )}
              </div>
              <div className="relative z-10 bottom-0 left-0 right-0 py-2 px-1 text-center">
                <h4 className="font-bold text-white text-[10px] md:text-xs truncate drop-shadow-md">{person.name}</h4>
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                <button onClick={() => handleOpenEdit(person)} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white transition-colors border border-white/10">✎</button>
                <button onClick={() => setDeleteModal({ isOpen: true, person })} className="bg-red-500/20 hover:bg-red-500/40 p-2 rounded-lg text-red-400 transition-colors border border-red-500/20">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <div className="bg-[#151922] border border-gray-700 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">{editingPerson ? 'تعديل بيانات الفنان' : 'إضافة فنان جديد'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><CloseIcon /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="md:col-span-4 space-y-6">
                <div className="aspect-square bg-gray-900 rounded-2xl border-2 border-dashed border-gray-700 flex items-end justify-center overflow-hidden relative group">
                  {editingPerson?.image ? (
                    <img src={editingPerson.image} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-end justify-center">
                      <UserIcon className="w-full h-full text-gray-700/50" />
                    </div>
                  )}
                </div>
                <input 
                  type="text" 
                  placeholder="رابط الصورة الشخصية" 
                  value={editingPerson?.image || ''}
                  onChange={e => setEditingPerson(prev => ({...prev!, image: e.target.value}))}
                  className="w-full bg-[#0f1014] border border-gray-700 rounded-xl px-4 py-2 text-xs text-gray-400 focus:border-[#00A7F8] outline-none"
                />
              </div>

              <div className="md:col-span-8 space-y-6">
                <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-2xl">
                  <label className="block text-xs font-bold text-blue-400 mb-2">استيراد ذكي من TMDB</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="ابحث بالاسم في TMDB..." 
                      value={tmdbSearchQuery}
                      onChange={e => setTmdbSearchQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && searchTMDB()}
                      className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 outline-none"
                    />
                    <button onClick={searchTMDB} disabled={isSearchingTMDB} className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-xl text-sm font-bold">
                      {isSearchingTMDB ? '...' : 'بحث'}
                    </button>
                  </div>
                  {tmdbResults.length > 0 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                      {tmdbResults.slice(0, 5).map(res => (
                        <div key={res.id} onClick={() => fetchPersonDetails(res.id)} className="flex-shrink-0 cursor-pointer bg-gray-800 rounded-lg p-2 flex items-center gap-3 hover:bg-gray-700 transition-colors border border-gray-700">
                          <img src={`https://image.tmdb.org/t/p/w200${res.profile_path}`} className="w-8 h-8 rounded-full object-cover" />
                          <span className="text-xs font-bold whitespace-nowrap">{res.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">الاسم الكامل</label>
                    <input 
                      type="text" 
                      value={editingPerson?.name || ''}
                      onChange={e => setEditingPerson(prev => ({...prev!, name: e.target.value}))}
                      className="w-full bg-[#0f1014] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#00A7F8] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">الدور الأساسي</label>
                    <select 
                      value={editingPerson?.role || 'actor'}
                      onChange={e => setEditingPerson(prev => ({...prev!, role: e.target.value as any}))}
                      className="w-full bg-[#0f1014] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#00A7F8] outline-none"
                    >
                      <option value="actor">ممثل (Actor)</option>
                      <option value="director">مخرج (Director)</option>
                      <option value="writer">كاتب (Writer)</option>
                      <option value="crew">طاقم عمل (Crew)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">السيرة الذاتية</label>
                  <textarea 
                    value={editingPerson?.biography || ''}
                    onChange={e => setEditingPerson(prev => ({...prev!, biography: e.target.value}))}
                    rows={4}
                    className="w-full bg-[#0f1014] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#00A7F8] outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
                  <button onClick={() => setIsModalOpen(false)} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-xl">إلغاء</button>
                  <button onClick={handleSave} className="bg-gradient-to-r from-[#00A7F8] to-[#00FFB0] text-black font-black py-3 px-12 rounded-xl">حفظ البيانات</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmationModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, person: null })}
        onConfirm={handleDelete}
        title="حذف ملف الفنان"
        message={`هل أنت متأكد من حذف ملف "${deleteModal.person?.name}"؟`}
      />
    </div>
  );
};

export default PeopleManagerTab;
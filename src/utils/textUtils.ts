export const normalizeText = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Collapse spaces
    .replace(/[\u064B-\u065F\u0670]/g, '') // Remove diacritics (tashkeel)
    .replace(/[أإآ]/g, 'ا') // Unify Alef
    .replace(/ة/g, 'ه') // Unify Taa Marbuta to Haa
    .replace(/ى/g, 'ي'); // Unify Alif Maqsura to Yaa
};
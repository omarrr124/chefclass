export const autoTranslate = async (text, targetLang, sourceLang = 'en') => {
  if (!text) return '';
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const json = await response.json();
    return json[0].map(item => item[0]).join('');
  } catch (error) {
    console.error(`Translation error to ${targetLang}:`, error);
    return text; // fallback to original if it fails
  }
};

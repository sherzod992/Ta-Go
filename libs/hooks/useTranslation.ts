import { useLanguageContext } from '../contexts/LanguageContext';
import { useMemo } from 'react';

// 번역 데이터
const translations = {
  ko: {
    'Home': '홈',
    'Buy': '구매',
    'Sell': '판매',
    'Agents': '에이전트',
    'Community': '커뮤니티',
    'CS': '고객지원',
    'FAQ': '자주 묻는 질문',
    'Login': '로그인',
    'Logout': '로그아웃',
    'Korean': '한국어',
    'English': '영어',
    'Japanese': '일본어',
    'Russian': '러시아어',
    'Language Selection': '언어 선택',
    'Redirecting...': '리다이렉트 중...',
  },
  en: {
    'Home': 'Home',
    'Buy': 'Buy',
    'Sell': 'Sell',
    'Agents': 'Agents',
    'Community': 'Community',
    'CS': 'Customer Service',
    'FAQ': 'FAQ',
    'Login': 'Login',
    'Logout': 'Logout',
    'Korean': 'Korean',
    'English': 'English',
    'Japanese': 'Japanese',
    'Russian': 'Russian',
    'Language Selection': 'Language Selection',
    'Redirecting...': 'Redirecting...',
  },
  ja: {
    'Home': 'ホーム',
    'Buy': '購入',
    'Sell': '販売',
    'Agents': 'エージェント',
    'Community': 'コミュニティ',
    'CS': 'カスタマーサポート',
    'FAQ': 'よくある質問',
    'Login': 'ログイン',
    'Logout': 'ログアウト',
    'Korean': '韓国語',
    'English': '英語',
    'Japanese': '日本語',
    'Russian': 'ロシア語',
    'Language Selection': '言語選択',
    'Redirecting...': 'リダイレクト中...',
  },
  ru: {
    'Home': 'Главная',
    'Buy': 'Купить',
    'Sell': 'Продать',
    'Agents': 'Агенты',
    'Community': 'Сообщество',
    'CS': 'Поддержка',
    'FAQ': 'FAQ',
    'Login': 'Войти',
    'Logout': 'Выйти',
    'Korean': 'Корейский',
    'English': 'Английский',
    'Japanese': 'Японский',
    'Russian': 'Русский',
    'Language Selection': 'Выбор языка',
    'Redirecting...': 'Перенаправление...',
  },
};

export const useTranslation = () => {
  const { currentLanguage } = useLanguageContext();

  const t = useMemo(() => {
    return (key: string): string => {
      const langTranslations = translations[currentLanguage as keyof typeof translations];
      return langTranslations[key as keyof typeof langTranslations] || key;
    };
  }, [currentLanguage]);

  return { t, currentLanguage };
};

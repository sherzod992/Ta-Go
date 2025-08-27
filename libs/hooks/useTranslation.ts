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
    'Chat': '채팅',
    'Unknown': '알 수 없음',
    'Loading chat list...': '채팅 목록을 불러오는 중...',
    'No chat history yet': '아직 채팅 내역이 없습니다',
    'No message': '메시지가 없습니다',
    '{{count}} new messages': '{{count}}개의 새 메시지',
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
    'Chat': 'Chat',
    'Unknown': 'Unknown',
    'Loading chat list...': 'Loading chat list...',
    'No chat history yet': 'No chat history yet',
    'No message': 'No message',
    '{{count}} new messages': '{{count}} new messages',
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
    'Chat': 'チャット',
    'Unknown': '不明',
    'Loading chat list...': 'チャットリストを読み込み中...',
    'No chat history yet': 'まだチャット履歴がありません',
    'No message': 'メッセージがありません',
    '{{count}} new messages': '{{count}}件の新しいメッセージ',
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
    'Chat': 'Чат',
    'Unknown': 'Неизвестно',
    'Loading chat list...': 'Загрузка списка чатов...',
    'No chat history yet': 'История чатов пока пуста',
    'No message': 'Нет сообщений',
    '{{count}} new messages': '{{count}} новых сообщений',
  },
};

export const useTranslation = () => {
  const { currentLanguage } = useLanguageContext();

  const t = useMemo(() => {
    return (key: string, variables?: Record<string, any>): string => {
      const langTranslations = translations[currentLanguage as keyof typeof translations];
      let translation = langTranslations[key as keyof typeof langTranslations] || key;
      
      // 변수 치환 처리
      if (variables) {
        Object.keys(variables).forEach(varKey => {
          const regex = new RegExp(`{{${varKey}}}`, 'g');
          translation = translation.replace(regex, String(variables[varKey]));
        });
      }
      
      return translation;
    };
  }, [currentLanguage]);

  return { t, currentLanguage };
};

import { makeVar } from '@apollo/client';
import { CustomJwtPayload } from '../libs/types/customJwtPayload';

// 테마 관련 상태를 저장하는 반응형 변수
export const themeVar = makeVar<{
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  language: 'ko' | 'en';
}>({
  mode: 'light',
  primaryColor: '#e92C28',
  secondaryColor: '#bdbdbd',
  fontSize: 'medium',
  language: 'ko',
});

// 사용자 정보를 저장하는 반응형 변수
export const userVar = makeVar<CustomJwtPayload | null>(null);

// WebSocket 연결 인스턴스를 저장하는 반응형 변수
export const socketVar = makeVar<WebSocket | null>(null);

// 로딩 상태를 관리하는 반응형 변수
export const loadingVar = makeVar<{
  global: boolean;
  auth: boolean;
  data: boolean;
}>({
  global: false,
  auth: false,
  data: false,
});

// 알림 상태를 관리하는 반응형 변수
export const notificationVar = makeVar<{
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration: number;
}>({
  show: false,
  type: 'info',
  message: '',
  duration: 3000,
});

// 모달 상태를 관리하는 반응형 변수
export const modalVar = makeVar<{
  show: boolean;
  type: 'login' | 'register' | 'confirm' | 'custom';
  title: string;
  content: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}>({
  show: false,
  type: 'custom',
  title: '',
  content: '',
});

// 사이드바 상태를 관리하는 반응형 변수
export const sidebarVar = makeVar<{
  open: boolean;
  collapsed: boolean;
}>({
  open: false,
  collapsed: false,
});

// 검색 상태를 관리하는 반응형 변수
export const searchVar = makeVar<{
  query: string;
  filters: {
    category: string;
    price: {
      min: number;
      max: number;
    };
    brand: string[];
    type: string[];
  };
  results: any[];
  loading: boolean;
}>({
  query: '',
  filters: {
    category: '',
    price: {
      min: 0,
      max: 1000000,
    },
    brand: [],
    type: [],
  },
  results: [],
  loading: false,
});

// 페이지네이션 상태를 관리하는 반응형 변수
export const paginationVar = makeVar<{
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
}>({
  currentPage: 1,
  totalPages: 1,
  itemsPerPage: 10,
  totalItems: 0,
});

// 정렬 상태를 관리하는 반응형 변수
export const sortVar = makeVar<{
  field: string;
  direction: 'asc' | 'desc';
}>({
  field: 'createdAt',
  direction: 'desc',
});

// 필터 상태를 관리하는 반응형 변수
export const filterVar = makeVar<{
  active: boolean;
  applied: Record<string, any>;
}>({
  active: false,
  applied: {},
});

// 실시간 연결 상태를 관리하는 반응형 변수
export const connectionVar = makeVar<{
  websocket: 'connected' | 'disconnected' | 'connecting';
  api: 'connected' | 'disconnected' | 'connecting';
  lastSync: Date | null;
}>({
  websocket: 'disconnected',
  api: 'disconnected',
  lastSync: null,
});

// 사용자 설정을 관리하는 반응형 변수
export const settingsVar = makeVar<{
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showPhone: boolean;
  };
  preferences: {
    autoSave: boolean;
    darkMode: boolean;
    compactMode: boolean;
  };
}>({
  notifications: {
    email: true,
    push: true,
    sms: false,
  },
  privacy: {
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
  },
  preferences: {
    autoSave: true,
    darkMode: false,
    compactMode: false,
  },
});

// 캐시 상태를 관리하는 반응형 변수
export const cacheVar = makeVar<{
  lastCleared: Date | null;
  size: number;
  maxSize: number;
}>({
  lastCleared: null,
  size: 0,
  maxSize: 100,
});

// 에러 상태를 관리하는 반응형 변수
export const errorVar = makeVar<{
  hasError: boolean;
  message: string;
  code: string;
  timestamp: Date | null;
}>({
  hasError: false,
  message: '',
  code: '',
  timestamp: null,
});

// 성공 상태를 관리하는 반응형 변수
export const successVar = makeVar<{
  hasSuccess: boolean;
  message: string;
  timestamp: Date | null;
}>({
  hasSuccess: false,
  message: '',
  timestamp: null,
});

// 반응형 변수 초기화 함수
export const initializeReactiveVars = () => {
  // 로컬 스토리지에서 사용자 정보 복원
  if (typeof window !== 'undefined') {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        userVar(JSON.parse(savedUser));
      } catch (error) {
        console.error('사용자 정보 복원 실패:', error);
      }
    }

    // 테마 설정 복원
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      try {
        themeVar(JSON.parse(savedTheme));
      } catch (error) {
        console.error('테마 설정 복원 실패:', error);
      }
    }

    // 사용자 설정 복원
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      try {
        settingsVar(JSON.parse(savedSettings));
      } catch (error) {
        console.error('사용자 설정 복원 실패:', error);
      }
    }
  }
};

// 반응형 변수 정리 함수
export const clearReactiveVars = () => {
  userVar(null);
  socketVar(null);
  loadingVar({ global: false, auth: false, data: false });
  notificationVar({ show: false, type: 'info', message: '', duration: 3000 });
  modalVar({ show: false, type: 'custom', title: '', content: '' });
  sidebarVar({ open: false, collapsed: false });
  searchVar({
    query: '',
    filters: {
      category: '',
      price: { min: 0, max: 1000000 },
      brand: [],
      type: [],
    },
    results: [],
    loading: false,
  });
  paginationVar({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 10,
    totalItems: 0,
  });
  sortVar({ field: 'createdAt', direction: 'desc' });
  filterVar({ active: false, applied: {} });
  connectionVar({
    websocket: 'disconnected',
    api: 'disconnected',
    lastSync: null,
  });
  errorVar({ hasError: false, message: '', code: '', timestamp: null });
  successVar({ hasSuccess: false, message: '', timestamp: null });
};

// 반응형 변수 상태 저장 함수
export const saveReactiveVarsState = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(userVar()));
    localStorage.setItem('theme', JSON.stringify(themeVar()));
    localStorage.setItem('settings', JSON.stringify(settingsVar()));
  }
};

// 반응형 변수 상태 복원 함수
export const restoreReactiveVarsState = () => {
  initializeReactiveVars();
};

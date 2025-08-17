declare global {
  interface Window {
    Telegram?: {
      Login: {
        auth: (options: { bot_id: string }, callback: (data: any) => void) => void;
      };
    };
  }
}

export {};

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';
import { UiProvider } from '@/context/UiContext';
import { UserProvider } from '@/context/UserContext';
import { WbsProvider } from '@/context/WbsContext';
import '@/styles/main.scss';

// Provider 중첩 순서에 의미가 있다.
// Ui(Toast) → User(현재 사용자) → Wbs(데이터) 순으로 감싸야
// WbsProvider 가 Toast 와 현재 사용자 id 를 참조할 수 있다.
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UiProvider>
      <UserProvider>
        <WbsProvider>
          <App />
        </WbsProvider>
      </UserProvider>
    </UiProvider>
  </React.StrictMode>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// #region agent log
fetch('http://127.0.0.1:7242/ingest/2b592729-be1a-46fb-8bcd-2c8271753022',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:6',message:'main.tsx entry',data:{hasRoot:!!document.getElementById('root')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C'})}).catch(()=>{});
// #endregion

try {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/2b592729-be1a-46fb-8bcd-2c8271753022',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:12',message:'React render successful',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C'})}).catch(()=>{});
  // #endregion
} catch (error) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/2b592729-be1a-46fb-8bcd-2c8271753022',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:16',message:'React render error',data:{error:String(error),stack:error instanceof Error?error.stack:''},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C'})}).catch(()=>{});
  // #endregion
  throw error;
}



 
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useRegisterSW } from 'virtual:pwa-register/react';

const RootComponent = () => {
  
// isko infuture shi krduga bad mai
 
  //const {
  //  needRefresh,
  //  offlineReady,
  //  updateServiceWorker
  //} = useRegisterSW({
  //  onOfflineReady() {
  //    console.log('✅ App is ready to work offline');
  //  },
  //  onNeedRefresh() {
  //    console.log('🔄 New content available');
  //  },
  //});
// 👇 Add this right here

  return (

    <>
    
      {/*{needRefresh && (
        <div className="refresh-banner">
          <p>🔄 New update available!</p>
          <button onClick={() => updateServiceWorker(true)}>Refresh</button>
        </div>
      )}*/}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </>
  );
};

createRoot(document.getElementById('root')).render(<RootComponent />);

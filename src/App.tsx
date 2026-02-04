import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ListPage } from './pages/ListPage';
import { NewPage } from './pages/NewPage';
import { EditPage } from './pages/EditPage';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ToastProvider } from './components/Toast';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="app">
          <OfflineIndicator />
          <Routes>
            <Route path="/" element={<ListPage />} />
            <Route path="/new" element={<NewPage />} />
            <Route path="/edit/:id" element={<EditPage />} />
          </Routes>
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;

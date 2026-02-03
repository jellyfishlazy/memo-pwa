import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ListPage } from './pages/ListPage';
import { NewPage } from './pages/NewPage';
import { EditPage } from './pages/EditPage';
import { OfflineIndicator } from './components/OfflineIndicator';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <OfflineIndicator />
        <Routes>
          <Route path="/" element={<ListPage />} />
          <Route path="/new" element={<NewPage />} />
          <Route path="/edit/:id" element={<EditPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

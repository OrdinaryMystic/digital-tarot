import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import TarotTable from './pages/TarotTable';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/read" element={<TarotTable />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

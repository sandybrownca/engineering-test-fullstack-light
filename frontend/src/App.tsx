import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import PropertyList from './components/PropertyList';
import PropertyDetail from './components/PropertyDetail';
import CoordinateSearch from './components/CoordinateSearch';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-slate-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-white text-xl font-bold">Zesty.ai Property Search</h1>
              <div className="flex space-x-8">
                <Link to="/" className="text-white hover:text-blue-300 transition">
                  All Properties
                </Link>
                <Link to="/search" className="text-white hover:text-blue-300 transition">
                  Search by Coordinates
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<PropertyList />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/search" element={<CoordinateSearch />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
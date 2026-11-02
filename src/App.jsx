import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import { AccountProvider } from './context/AccountContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Buildings from './components/Buildings';
import ChiefGear from './components/ChiefGear';
import ChiefCharm from './components/ChiefCharm';
import Pets from './components/Pets';
import Experts from './components/Experts';
import SvS from './components/SvS';
import AuthModal from './components/AuthModal';

const RouteTracker = () => {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname !== '/' && location.pathname !== '/index.html') {
      localStorage.setItem('wosCalc_lastRoute', location.pathname);
    }
  }, [location]);
  return null;
};

const IndexRedirect = () => {
  const lastRoute = localStorage.getItem('wosCalc_lastRoute') || '/upgrade';
  return <Navigate to={lastRoute} replace />;
};

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('wosCalc_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <LanguageProvider>
      <AccountProvider>
        <AuthProvider>
        <Router>
          <RouteTracker />
          <Layout>
            <Routes>
              <Route path="/" element={<IndexRedirect />} />
              <Route path="/index.html" element={<IndexRedirect />} />
              <Route path="/upgrade" element={<Buildings />} />
              <Route path="/chiefGear" element={<ChiefGear />} />
              <Route path="/chiefCharm" element={<ChiefCharm />} />
              <Route path="/pets" element={<Pets />} />
              <Route path="/experts" element={<Experts />} />
              <Route path="/svs" element={<SvS />} />
            </Routes>
          </Layout>
          <AuthModal />
        </Router>
      </AuthProvider>
    </AccountProvider>
    </LanguageProvider>
  );
}

export default App;


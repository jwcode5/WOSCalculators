import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import { AccountProvider } from './context/AccountContext';
import { AuthProvider } from './context/AuthContext';
import Buildings from './components/Buildings';
import ChiefGear from './components/ChiefGear';
import ChiefCharm from './components/ChiefCharm';
import Pets from './components/Pets';
import Experts from './components/Experts';
import SvS from './components/SvS';
import AuthModal from './components/AuthModal';

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('wosCalc_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <AccountProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/upgrade" replace />} />
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
  );
}

export default App;


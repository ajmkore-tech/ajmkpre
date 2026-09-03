import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Clients from './pages/Clients';
import Configuracion from './pages/Configuracion';
import SimplePage from './components/SimplePage';
import CxP from './pages/CxP';
import Compras from './pages/Compras';
import CxC from './pages/CxC';
import Reports from './pages/Reports';
import { AppProvider } from './context/AppContext';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/inicio" replace />} />
            <Route path="inicio" element={<SimplePage title="Inicio" />} />
            <Route path="ventas" element={<Sales />} />
            <Route path="clientes" element={<Clients />} />
            <Route path="compras" element={<Compras />} />
            <Route path="inventarios" element={<Inventory />} />
            <Route path="cxp" element={<CxP />} />
            <Route path="cxc" element={<CxC />} />
            <Route path="reportes" element={<Reports />} />
            <Route path="configuracion" element={<Configuracion />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

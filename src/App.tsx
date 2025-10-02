import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';

import Home from './screens/Home';
import Dashboard from './screens/dashboard';
import CompanyRegistration from './screens/company_reg';
import LicenceManagement from './screens/licence_servc';
import InformationSystemManagement from './screens/it_and_info_system';
import CompanyRegistration2 from './screens/registration/comp_reg';
import CollegeRegistration from './screens/registration/college_reg';
import TaxConsultancyManagement from './screens/tax_consulting';
import BuinsessSoftwareManagement from './screens/business_software';
import AccountingManagement from './screens/accounting_management';
import AuditAndAssuranceManagement from './screens/audit_issuarance';
import BusinessStrategy from './screens/business_strtgy';
import MicrosoftServices from './screens/microsoft_management';
import AppliedServices from './screens/applied_services';
import LoginPage from './screens/login';
import RegisterPage from './screens/register';

// Create a theme for Material-UI
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Routes WITHOUT Layout */}
          <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />


          {/* Routes WITH Layout */}
          <Route
            element={<Layout  />}
          >
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/applied-services" element={<AppliedServices />} />
            <Route path="/company-registration" element={<CompanyRegistration />} />
            <Route path="/licence-registration" element={<LicenceManagement />} />
            <Route path="/it-registration" element={<InformationSystemManagement />} />
            <Route path="/accounting-management" element={<AccountingManagement />} />
            <Route path="/audit-assurance" element={<AuditAndAssuranceManagement />} />
            <Route path="/business-strategies" element={<BusinessStrategy />} />
            <Route path="/microsoft-services" element={<MicrosoftServices />} />
            <Route path="/company-registration-service" element={<CompanyRegistration2 />} />
            <Route path="/college-registration" element={<CollegeRegistration />} />
            <Route path="/tax-consulting" element={<TaxConsultancyManagement />} />
            <Route path="/business-software" element={<BuinsessSoftwareManagement />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Paper
} from '@mui/material';
import {
  Business as BusinessIcon,
  Replay as ReRegisterIcon,
  Cancel as DeRegisterIcon,
  School as CollegeIcon,
  ConfirmationNumber as VendorIcon,
  Receipt as VatIcon,
  Assignment as PrazIcon,
  Church as ChurchIcon,
  Groups as NassaIcon,
  Update as AnnualReturnsIcon
} from '@mui/icons-material';
import PrazRegistration from '../screens/registration/praz';
import CompanyDeregistration from './registration/de_reg';
import VendorNumber from './registration/vendor_num';
import ChurchRegistration from './registration/chruch_reg';
import CompanyRegistration2 from './registration/comp_reg';
import CollegeRegistration from './registration/college_reg';

// Define the sub-services for company registration
const subServices = [
  { id: 'company-registration-service', label: 'Company Registration', icon: <BusinessIcon /> },
  { id: 'company-reregistration', label: 'Company Re-registration', icon: <ReRegisterIcon /> },
  { id: 'company-deregistration', label: 'Company De-registration', icon: <DeRegisterIcon /> },
  { id: 'college-registration', label: 'College Registration', icon: <CollegeIcon /> },
  { id: 'vendor-number', label: 'Vendor Number', icon: <VendorIcon /> },
  { id: 'vat-registration', label: 'VAT Registration', icon: <VatIcon /> },
  { id: 'praz-registration', label: 'PRAZ Registration', icon: <PrazIcon /> },
  { id: 'church-registration', label: 'Church Registration', icon: <ChurchIcon /> },
  { id: 'nassa-registration', label: 'NASSA Registration', icon: <NassaIcon /> },
  { id: 'annual-returns', label: 'Annual Returns', icon: <AnnualReturnsIcon /> }
];

// Main Company Registration Component
const CompanyRegistration: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeService, setActiveService] = useState('praz-registration');

  const handleServiceChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveService(newValue);
  };

  // Render the appropriate component based on selected service
  const renderServiceContent = () => {
    switch (activeService) {
       case 'company-registration-service':
      return <CompanyRegistration2 />;
      case 'college-registration':
      return <CollegeRegistration />;

       case 'company-reregistration':
      return <CompanyRegistration2 />;
      case 'praz-registration':
        return <PrazRegistration />;
      case 'company-deregistration':
        return <CompanyDeregistration />;
      case 'vendor-number':
        return <VendorNumber />;
      case 'church-registration':
        return <ChurchRegistration />;
      // Add cases for other services as they are developed
      default:
        return (
          <Box sx={{ 
            p: 4, 
            textAlign: 'center',
            minHeight: 400,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Typography variant="h4" color="primary" gutterBottom>
              {subServices.find(service => service.id === activeService)?.label}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              This service is coming soon. Please check back later.
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ 
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0
    }}>
      {/* Header */}
      <Box sx={{ p: 3, pb: 0 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Company Registration Services
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Select a service below to manage your registrations
        </Typography>
      </Box>

      {/* Services Navigation */}
      <Paper 
        elevation={1} 
        sx={{ 
          mx: 3, 
          mb: 3,
          backgroundColor: theme.palette.background.paper,
          overflow: 'hidden'
        }}
      >
        <Tabs
          value={activeService}
          onChange={handleServiceChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: 64,
            '& .MuiTab-root': {
              minWidth: 'auto',
              px: 2,
              fontSize: isMobile ? '0.7rem' : '0.8rem',
              '& .MuiSvgIcon-root': {
                fontSize: isMobile ? '1rem' : '1.25rem',
                mb: isMobile ? 0 : 0.5,
                mr: isMobile ? 0 : 1
              }
            }
          }}
        >
          {subServices.map((service) => (
            <Tab
              key={service.id}
              value={service.id}
              icon={isMobile ? service.icon : undefined}
              iconPosition="start"
              label={isMobile ? service.label.split(' ')[0] : service.label}
              sx={{
                minHeight: 64,
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Service Content */}
      <Box sx={{ 
        flex: 1,
        overflow: 'auto',
        px: 3,
        pb: 3
      }}>
        {renderServiceContent()}
      </Box>
    </Box>
  );
};

export default CompanyRegistration;
import React, { type ReactNode, useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  Collapse,
  ListItemAvatar,
  Avatar,
  ListSubheader
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as ServicesIcon,
  ExpandLess,
  ExpandMore,
  Business as BusinessIcon,
  Receipt as TaxIcon,
  Storage as ITIcon,
  Description as SoftwareIcon,
  Calculate as AccountingIcon,
  VerifiedUser as AuditIcon,
  TrendingUp as StrategyIcon,
  Apps as MicrosoftIcon,
  Person
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

// Import your logo image - update the path to match your actual logo file
import logoImage from '../assets/logo.png'; // Adjust this path to your logo

const drawerWidth = 240;

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [servicesOpen, setServicesOpen] = useState(false);

  const handleServicesClick = () => {
    setServicesOpen(!servicesOpen);
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard'
    },
    {
      text: 'Applied Services',
      icon: <ServicesIcon />,
      path: '/applied-services',
      hasDropdown: true
    },
     
  ];

  const serviceItems = [
    { text: 'Company Registration', path: '/company-registration' },
    { text: 'Licensing', path: '/licence-registration' },
    { text: 'Tax Consulting', path: '/tax-consulting' },
    { text: 'IT and Information System', path: '/it-registration' },
    { text: 'Business Software', path: '/business-software' },
    { text: 'Accounting and Management', path: '/accounting-management' },
    { text: 'Audit and Assurance', path: '/audit-assurance' },
    { text: 'Business Strategies',  path: '/business-strategies' },
    { text: 'Microsoft Services', path: '/microsoft-services' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Application Portal
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        {/* Logo Section at the top of the sidebar */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <img 
            src={logoImage} 
            alt="Company Logo" 
            style={{ 
              maxWidth: '180px', 
              maxHeight: '60px',
              objectFit: 'contain'
            }} 
          />
        </Box>
        
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <React.Fragment key={item.text}>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={item.hasDropdown ? handleServicesClick : () => navigate(item.path)}
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: theme.palette.primary.main,
                        color: 'white',
                        '&:hover': {
                          backgroundColor: theme.palette.primary.dark,
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: location.pathname === item.path ? 'white' : 'inherit'
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                    {item.hasDropdown && (servicesOpen ? <ExpandLess /> : <ExpandMore />)}
                  </ListItemButton>
                </ListItem>
                
                {item.hasDropdown && (
                  <Collapse in={servicesOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      <ListSubheader sx={{ 
                        bgcolor: theme.palette.primary.light,
                        color: 'white'
                      }}>
                        Available Services
                      </ListSubheader>
                      {serviceItems.map((service) => (
                        <ListItemButton 
                          key={service.text}
                          sx={{ pl: 4 }}
                          selected={location.pathname === service.path}
                          onClick={() => navigate(service.path)}
                        >
                          <ListItemIcon>
                            {service.icon}
                          </ListItemIcon>
                          <ListItemText primary={service.text} />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          width: `calc(100% - ${drawerWidth}px)`,
        }}
      >
        <Toolbar /> {/* This pushes content below the app bar */}
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  useTheme
} from '@mui/material';
import {
  TrendingUp,
  Assignment,
  Payment,
  Schedule,
  CheckCircle,
  Pending,
  Error,
  Notifications,
  AccountBalance,
  Receipt,
  Business,
  Settings,
  BarChart,
  People
} from '@mui/icons-material';

// Types
interface Service {
  id: string;
  name: string;
  status: 'completed' | 'pending' | 'in-progress' | 'rejected';
  appliedDate: Date;
  progress?: number;
}

interface Stats {
  totalApplied: number;
  completed: number;
  pending: number;
  inProgress: number;
  rejected: number;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactElement;
  color: string;
}

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [services, setServices] = useState<Service[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalApplied: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    rejected: 0
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockServices: Service[] = [
      {
        id: '1',
        name: 'REGISTRATION',
        status: 'completed',
        appliedDate: new Date('2024-01-15'),
        progress: 100
      },
      {
        id: '2',
        name: 'LICENSING',
        status: 'in-progress',
        appliedDate: new Date('2024-01-20'),
        progress: 65
      },
      {
        id: '3',
        name: 'TAX CONSULTANCY',
        status: 'pending',
        appliedDate: new Date('2024-01-22'),
        progress: 0
      },
      {
        id: '4',
        name: 'BUSINESS SOFTWARE SERVICES',
        status: 'in-progress',
        appliedDate: new Date('2024-01-18'),
        progress: 45
      }
    ];

    setServices(mockServices);
    
    // Calculate stats
    setStats({
      totalApplied: mockServices.length,
      completed: mockServices.filter(s => s.status === 'completed').length,
      pending: mockServices.filter(s => s.status === 'pending').length,
      inProgress: mockServices.filter(s => s.status === 'in-progress').length,
      rejected: mockServices.filter(s => s.status === 'rejected').length
    });
  }, []);

  const quickActions: QuickAction[] = [
    {
      id: '1',
      label: 'Applyed Services',
      icon: <Assignment />,
      color: theme.palette.primary.main
    },
    {
      id: '2',
      label: 'Make Payment',
      icon: <Payment />,
      color: theme.palette.success.main
    },
    {
      id: '3',
      label: 'Schedule Meeting',
      icon: <Schedule />,
      color: theme.palette.warning.main
    },
    {
      id: '4',
      label: 'View Documents',
      icon: <Receipt />,
      color: theme.palette.info.main
    }
  ];

  const getStatusIcon = (status: Service['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'pending':
        return <Pending color="warning" />;
      case 'in-progress':
        return <BarChart color="info" />;
      case 'rejected':
        return <Error color="error" />;
      default:
        return <Pending color="warning" />;
    }
  };

  const getStatusColor = (status: Service['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'in-progress':
        return 'info';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back! Here's an overview of your applied services and quick actions.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.light, mr: 2 }}>
                  <Assignment />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.totalApplied}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Applied
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: theme.palette.success.light, mr: 2 }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.completed}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: theme.palette.warning.light, mr: 2 }}>
                  <Pending />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.pending + stats.inProgress}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    In Progress
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: theme.palette.error.light, mr: 2 }}>
                  <Error />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.rejected}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rejected
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Applications */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Applications
              </Typography>
              <List>
                {services.map((service, index) => (
                  <React.Fragment key={service.id}>
                    <ListItem>
                      <ListItemIcon>
                        {getStatusIcon(service.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={service.name}
                        secondary={`Applied: ${service.appliedDate.toLocaleDateString()}`}
                      />
                      <Chip
                        label={service.status.toUpperCase()}
                        color={getStatusColor(service.status) as any}
                        size="small"
                      />
                    </ListItem>
                    {service.progress !== undefined && service.progress > 0 && (
                      <Box sx={{ px: 2, pb: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={service.progress}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Progress: {service.progress}%
                        </Typography>
                      </Box>
                    )}
                    {index < services.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions & Services */}
        <Grid item xs={12} md={4}>
          {/* Quick Actions */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={1}>
                {quickActions.map((action) => (
                  <Grid item xs={6} key={action.id}>
                    <Paper
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          bgcolor: action.color,
                          color: 'white'
                        }
                      }}
                    >
                      <IconButton sx={{ color: action.color, mb: 1 }}>
                        {action.icon}
                      </IconButton>
                      <Typography variant="body2">{action.label}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Available Services */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Available Services
              </Typography>
              <List dense>
                {[
                  'REGISTRATION',
                  'LICENSING',
                  'TAX CONSULTANCY',
                  'IT & IS MANAGEMENT',
                  'BUSINESS SOFTWARE SERVICES',
                  'ACCOUNTING & MANAGEMENT CONSULTANCY',
                  'AUDIT & ASSURANCE',
                  'BUSINESS STRATEGY & STRATEGY REVIEW',
                  'MICROSOFT SERVICES'
                ].map((service) => (
                  <ListItem key={service}>
                    <ListItemIcon>
                      <Business fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={service} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Notifications Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Notifications sx={{ mr: 1 }} />
            <Typography variant="h6">Recent Notifications</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Your licensing application requires additional documents. Please upload them by Jan 30, 2024.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Tax consultancy meeting scheduled for Feb 5, 2024 at 2:00 PM.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
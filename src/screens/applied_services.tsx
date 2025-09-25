import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Grid,
  Paper,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as ViewIcon,
  Support as SupportIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import appiledService from '../services/applied_service_service'; 

// Types
interface Service {
  id: string;
  name: string;
  category: string;
  status: 'completed' | 'pending' | 'in-progress' | 'rejected';
  appliedDate: Date;
  completionDate?: Date;
  progress?: number;
  referenceNumber: string;
  assignedTo?: string;
}

interface FilterOptions {
  category: string;
  status: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

// Map API status to component status
const mapApiStatusToComponentStatus = (apiStatus: string): Service['status'] => {
  switch (apiStatus.toLowerCase()) {
    case 'completed':
      return 'completed';
    case 'pending':
      return 'pending';
    case 'in-progress':
    case 'in progress':
      return 'in-progress';
    case 'rejected':
      return 'rejected';
    default:
      return 'pending';
  }
};

// Map API data to Service interface
const mapApiDataToService = (apiData: any): Service => {
  // Generate a unique ID if not provided
  const id = apiData.id || Math.random().toString(36).substr(2, 9);
  
  // Use serviceType as name if available
  const name = apiData.serviceType || 'Unknown Service';
  
  // Use businessType as category if available
  const category = apiData.businessType || 'GENERAL';
  
  // Map status
  const status = mapApiStatusToComponentStatus(apiData.status || 'pending');
  
  // Use current date as applied date if not provided
  const appliedDate = apiData.appliedDate ? new Date(apiData.appliedDate) : new Date();
  
  // Generate a reference number if not provided
  const referenceNumber = apiData.registrationNumber || `REF-${Math.floor(100000 + Math.random() * 900000)}`;
  
  // Use applicant name as assigned to if not provided
  const assignedTo = apiData.assignedTo || apiData.applicantName || 'Unassigned';
  
  // Calculate progress based on status
  let progress = 0;
  if (status === 'completed') progress = 100;
  else if (status === 'in-progress') progress = Math.floor(Math.random() * 50) + 30;
  else if (status === 'rejected') progress = 0;
  
  return {
    id,
    name,
    category,
    status,
    appliedDate,
    referenceNumber,
    assignedTo,
    progress
  };
};

const AppliedServices: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    category: 'all',
    status: 'all',
    dateRange: {
      start: null,
      end: null
    }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await appiledService.getAllAppliedService();
        
        // Map API response to Service objects
        const mappedServices = response.map((item: any) => mapApiDataToService(item));
        
        setServices(mappedServices);
        setFilteredServices(mappedServices);
        setError(null);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Get unique categories for filter dropdown
  const categories = ['all', ...new Set(services.map(service => service.category))];
  const statusOptions = ['all', 'completed', 'pending', 'in-progress', 'rejected'];

  // Filter services based on filter options and search term
  useEffect(() => {
    let filtered = services;

    // Filter by category
    if (filterOptions.category !== 'all') {
      filtered = filtered.filter(service => 
        service.category === filterOptions.category
      );
    }

    // Filter by status
    if (filterOptions.status !== 'all') {
      filtered = filtered.filter(service => 
        service.status === filterOptions.status
      );
    }

    // Filter by date range
    if (filterOptions.dateRange.start) {
      filtered = filtered.filter(service => 
        service.appliedDate >= filterOptions.dateRange.start!
      );
    }
    if (filterOptions.dateRange.end) {
      filtered = filtered.filter(service => 
        service.appliedDate <= filterOptions.dateRange.end!
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  }, [services, filterOptions, searchTerm]);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilterOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDateRangeChange = (type: 'start' | 'end', date: Date | null) => {
    setFilterOptions(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [type]: date
      }
    }));
  };

  const clearFilters = () => {
    setFilterOptions({
      category: 'all',
      status: 'all',
      dateRange: {
        start: null,
        end: null
      }
    });
    setSearchTerm('');
  };

  const getStatusColor = (status: Service['status']): string => {
    switch (status) {
      case 'completed':
        return theme.palette.success.main;
      case 'pending':
        return theme.palette.warning.main;
      case 'in-progress':
        return theme.palette.info.main;
      case 'rejected':
        return theme.palette.error.main;
      default:
        return theme.palette.warning.main;
    }
  };

  const getStatusIcon = (status: Service['status']) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'pending':
        return '⏳';
      case 'in-progress':
        return '📊';
      case 'rejected':
        return '❌';
      default:
        return '⏳';
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box sx={{ 
        flex: 1,
        p: 3,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 400
      }}>
        <Typography variant="h6">Loading services...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        flex: 1,
        p: 3,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 400
      }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      flex: 1,
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0
    }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Applied Services
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage all your applied business services
        </Typography>
      </Box>

      {/* Filters Section */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 3, 
          mb: 3,
          backgroundColor: theme.palette.background.paper
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon />
            <Typography variant="h6">Filters</Typography>
          </Box>
          <Button 
            onClick={clearFilters} 
            variant="outlined"
            startIcon={<ClearIcon />}
            size={isMobile ? "small" : "medium"}
          >
            Clear All Filters
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Search */}
          <Grid item xs={12} md={6} lg={3}>
            <TextField
              fullWidth
              label="Search"
              placeholder="Search by name, reference, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchTerm('')}
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* Category Filter */}
          <Grid item xs={12} md={6} lg={3}>
            <TextField
              fullWidth
              select
              label="Category"
              value={filterOptions.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              {categories.map(category => (
                <MenuItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Status Filter */}
          <Grid item xs={12} md={6} lg={3}>
            <TextField
              fullWidth
              select
              label="Status"
              value={filterOptions.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              {statusOptions.map(status => (
                <MenuItem key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Date Range Filters */}
          <Grid item xs={12} md={6} lg={3}>
            <TextField
              fullWidth
              type="date"
              label="Applied Date From"
              InputLabelProps={{ shrink: true }}
              onChange={(e) => handleDateRangeChange('start', e.target.value ? new Date(e.target.value) : null)}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <TextField
              fullWidth
              type="date"
              label="Applied Date To"
              InputLabelProps={{ shrink: true }}
              onChange={(e) => handleDateRangeChange('end', e.target.value ? new Date(e.target.value) : null)}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Results Count */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredServices.length} of {services.length} applied services
        </Typography>
      </Box>

      {/* Services List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {filteredServices.length === 0 ? (
          <Paper 
            elevation={1} 
            sx={{ 
              p: 8, 
              textAlign: 'center',
              backgroundColor: theme.palette.background.paper
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No services found matching your filters.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredServices.map((service) => (
              <Grid item xs={12} md={6} lg={4} key={service.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderLeft: `4px solid ${theme.palette.primary.main}`
                  }}
                >
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start', 
                      mb: 2,
                      gap: 1,
                      flexWrap: 'wrap'
                    }}>
                      <Box>
                        <Typography variant="h6" component="h3" gutterBottom>
                          {service.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          #{service.referenceNumber}
                        </Typography>
                      </Box>
                      <Chip
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <span>{getStatusIcon(service.status)}</span>
                            <span>{service.status.toUpperCase()}</span>
                          </Box>
                        }
                        sx={{ 
                          backgroundColor: getStatusColor(service.status),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                        size="small"
                      />
                    </Box>

                    {/* Details */}
                    <Box sx={{ mb: 2, flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          Category:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {service.category}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          Applied Date:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(service.appliedDate)}
                        </Typography>
                      </Box>
                      {service.completionDate && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            Completed Date:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(service.completionDate)}
                          </Typography>
                        </Box>
                      )}
                      {service.assignedTo && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            Assigned To:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {service.assignedTo}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Progress Bar */}
                    {service.progress !== undefined && service.progress > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={service.progress} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            mb: 1 
                          }}
                        />
                        <Typography variant="body2" color="text.secondary" align="right">
                          {service.progress}% Complete
                        </Typography>
                      </Box>
                    )}

                    {/* Actions */}
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      flexWrap: 'wrap',
                      mt: 'auto'
                    }}>
                      <Button
                        variant="contained"
                        startIcon={<ViewIcon />}
                        size="small"
                        fullWidth={isMobile}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<SupportIcon />}
                        size="small"
                        fullWidth={isMobile}
                      >
                        Contact Support
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default AppliedServices;
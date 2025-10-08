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
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as ViewIcon,
  Update as UpdateIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import appiledService from '../services/applied_service_service';

// Types
interface BusinessStrategyApplication {
  id: string;
  companyName: string;
  email: string;
  contactName: string;
  phoneNumber: string;
  status: 'approved' | 'pending' | 'in-review' | 'rejected';
  appliedDate: Date;
  updatedDate: Date;
  referenceNumber: string;
}

interface FilterOptions {
  status: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

// Status options for dropdown
const statusOptions = [
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-review', label: 'In Review' },
  { value: 'rejected', label: 'Rejected' }
];

// Map API status to component status
const mapApiStatusToComponentStatus = (apiStatus: string): BusinessStrategyApplication['status'] => {
  switch (apiStatus.toLowerCase()) {
    case 'approved':
      return 'approved';
    case 'pending':
      return 'pending';
    case 'in-review':
    case 'in review':
      return 'in-review';
    case 'rejected':
      return 'rejected';
    default:
      return 'pending';
  }
};

// Map API data to BusinessStrategyApplication interface
const mapApiDataToBusinessStrategyApplication = (apiData: any): BusinessStrategyApplication => {
  // Generate a unique ID if not provided
  const id = apiData.id || apiData._id || Math.random().toString(36).substr(2, 9);
  
  // Use createdAt for applied date if available
  const appliedDate = apiData.createdAt ? new Date(apiData.createdAt) : new Date();
  
  // Use updatedAt for updated date if available
  const updatedDate = apiData.updatedAt ? new Date(apiData.updatedAt) : new Date();
  
  // Generate a reference number if not provided
  const referenceNumber = apiData.referenceNumber || `STRAT-${Math.floor(100000 + Math.random() * 900000)}`;
  
  // Map status
  const status = mapApiStatusToComponentStatus(apiData.status || 'pending');
  
  return {
    id,
    companyName: apiData.companyName || 'Unknown Company',
    email: apiData.email || '',
    contactName: apiData.contactName || '',
    phoneNumber: apiData.phoneNumber || '',
    status,
    appliedDate,
    updatedDate,
    referenceNumber
  };
};

const BusinessStrategy: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [businessStrategyApplications, setBusinessStrategyApplications] = useState<BusinessStrategyApplication[]>([]);
  const [filteredBusinessStrategyApplications, setFilteredBusinessStrategyApplications] = useState<BusinessStrategyApplication[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: 'all',
    dateRange: {
      start: null,
      end: null
    }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBusinessStrategyApplication, setSelectedBusinessStrategyApplication] = useState<BusinessStrategyApplication | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Fetch data from API
  useEffect(() => {
    const fetchBusinessStrategyApplications = async () => {
      try {
        setLoading(true);
        const response = await appiledService.getAllAppliedService();
        
        // Map API response to BusinessStrategyApplication objects
        const mappedBusinessStrategyApplications = response.map((item: any) => mapApiDataToBusinessStrategyApplication(item));
        
        setBusinessStrategyApplications(mappedBusinessStrategyApplications);
        setFilteredBusinessStrategyApplications(mappedBusinessStrategyApplications);
        setError(null);
      } catch (err) {
        console.error('Error fetching business strategy applications:', err);
        setError('Failed to load business strategy applications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessStrategyApplications();
  }, []);

  const filterStatusOptions = ['all', 'approved', 'pending', 'in-review', 'rejected'];

  // Filter business strategy applications based on filter options and search term
  useEffect(() => {
    let filtered = businessStrategyApplications;

    // Filter by status
    if (filterOptions.status !== 'all') {
      filtered = filtered.filter(businessStrategyApplication => 
        businessStrategyApplication.status === filterOptions.status
      );
    }

    // Filter by date range
    if (filterOptions.dateRange.start) {
      filtered = filtered.filter(businessStrategyApplication => 
        businessStrategyApplication.appliedDate >= filterOptions.dateRange.start!
      );
    }
    if (filterOptions.dateRange.end) {
      filtered = filtered.filter(businessStrategyApplication => 
        businessStrategyApplication.appliedDate <= filterOptions.dateRange.end!
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(businessStrategyApplication =>
        businessStrategyApplication.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        businessStrategyApplication.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        businessStrategyApplication.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        businessStrategyApplication.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBusinessStrategyApplications(filtered);
  }, [businessStrategyApplications, filterOptions, searchTerm]);

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
      status: 'all',
      dateRange: {
        start: null,
        end: null
      }
    });
    setSearchTerm('');
  };

  const getStatusColor = (status: BusinessStrategyApplication['status']): string => {
    switch (status) {
      case 'approved':
        return theme.palette.success.main;
      case 'pending':
        return theme.palette.warning.main;
      case 'in-review':
        return theme.palette.info.main;
      case 'rejected':
        return theme.palette.error.main;
      default:
        return theme.palette.warning.main;
    }
  };

  const getStatusIcon = (status: BusinessStrategyApplication['status']) => {
    switch (status) {
      case 'approved':
        return '✅';
      case 'pending':
        return '⏳';
      case 'in-review':
        return '📋';
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

  const handleStatusUpdateClick = (businessStrategyApplication: BusinessStrategyApplication) => {
    setSelectedBusinessStrategyApplication(businessStrategyApplication);
    setSelectedStatus(businessStrategyApplication.status);
    setStatusDialogOpen(true);
  };

  const handleDeleteClick = (businessStrategyApplication: BusinessStrategyApplication) => {
    setSelectedBusinessStrategyApplication(businessStrategyApplication);
    setDeleteDialogOpen(true);
  };

  const handleStatusUpdate = async () => {
    try {
      if (!selectedBusinessStrategyApplication || !selectedStatus) return;
      
      await appiledService.updateAppliedService(selectedBusinessStrategyApplication.id, { status: selectedStatus });
      
      // Refresh the list
      const response = await appiledService.getAllAppliedService();
      const mappedBusinessStrategyApplications = response.map((item: any) => mapApiDataToBusinessStrategyApplication(item));
      setBusinessStrategyApplications(mappedBusinessStrategyApplications);
      
      setSnackbar({ open: true, message: 'Status updated successfully', severity: 'success' });
      setStatusDialogOpen(false);
    } catch (error) {
      console.error('Error updating status:', error);
      setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!selectedBusinessStrategyApplication) return;
      
      await appiledService.deleteAppliedService(selectedBusinessStrategyApplication.id);
      
      // Refresh the list
      const response = await appiledService.getAllAppliedService();
      const mappedBusinessStrategyApplications = response.map((item: any) => mapApiDataToBusinessStrategyApplication(item));
      setBusinessStrategyApplications(mappedBusinessStrategyApplications);
      
      setSnackbar({ open: true, message: 'Business strategy application deleted successfully', severity: 'success' });
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting business strategy application:', error);
      setSnackbar({ open: true, message: 'Failed to delete business strategy application', severity: 'error' });
    }
  };

  const calculateProgress = (status: BusinessStrategyApplication['status']): number => {
    switch (status) {
      case 'approved':
        return 100;
      case 'rejected':
        return 100;
      case 'in-review':
        return 50;
      case 'pending':
        return 25;
      default:
        return 0;
    }
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
        <Typography variant="h6">Loading business strategy applications...</Typography>
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
          Business Strategy Applications
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage all your business strategy applications
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
          <Grid item xs={12} md={6} lg={4}>
            <TextField
              fullWidth
              label="Search"
              placeholder="Search by company, reference, contact, or email..."
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

          {/* Status Filter */}
          <Grid item xs={12} md={6} lg={4}>
            <TextField
              fullWidth
              select
              label="Status"
              value={filterOptions.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              {filterStatusOptions.map(status => (
                <MenuItem key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Date Range Filters */}
          <Grid item xs={12} md={6} lg={4}>
            <TextField
              fullWidth
              type="date"
              label="Applied Date From"
              InputLabelProps={{ shrink: true }}
              onChange={(e) => handleDateRangeChange('start', e.target.value ? new Date(e.target.value) : null)}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
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
          Showing {filteredBusinessStrategyApplications.length} of {businessStrategyApplications.length} applications
        </Typography>
      </Box>

      {/* Business Strategy Applications List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {filteredBusinessStrategyApplications.length === 0 ? (
          <Paper 
            elevation={1} 
            sx={{ 
              p: 8, 
              textAlign: 'center',
              backgroundColor: theme.palette.background.paper
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No business strategy applications found matching your filters.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredBusinessStrategyApplications.map((businessStrategyApplication) => (
              <Grid item xs={12} md={6} lg={4} key={businessStrategyApplication.id}>
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
                          {businessStrategyApplication.companyName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          #{businessStrategyApplication.referenceNumber}
                        </Typography>
                      </Box>
                      <Chip
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <span>{getStatusIcon(businessStrategyApplication.status)}</span>
                            <span>{businessStrategyApplication.status.toUpperCase()}</span>
                          </Box>
                        }
                        sx={{ 
                          backgroundColor: getStatusColor(businessStrategyApplication.status),
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
                          Contact Name:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {businessStrategyApplication.contactName}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          Email:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {businessStrategyApplication.email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          Phone:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {businessStrategyApplication.phoneNumber}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          Applied Date:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(businessStrategyApplication.appliedDate)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          Last Updated:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(businessStrategyApplication.updatedDate)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Progress Bar */}
                    <Box sx={{ mb: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={calculateProgress(businessStrategyApplication.status)} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          mb: 1 
                        }}
                      />
                      <Typography variant="body2" color="text.secondary" align="right">
                        {calculateProgress(businessStrategyApplication.status)}% Complete
                      </Typography>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      flexWrap: 'wrap',
                      mt: 'auto'
                    }}>
                      {/* <Button
                        variant="contained"
                        startIcon={<ViewIcon />}
                        size="small"
                        fullWidth={isMobile}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<UpdateIcon />}
                        size="small"
                        onClick={() => handleStatusUpdateClick(businessStrategyApplication)}
                        fullWidth={isMobile}
                      >
                        Update Status
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        size="small"
                        onClick={() => handleDeleteClick(businessStrategyApplication)}
                        fullWidth={isMobile}
                      >
                        Delete
                      </Button> */}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Application Status</DialogTitle>
        <DialogContent>
          {selectedBusinessStrategyApplication && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                Update status for <strong>{selectedBusinessStrategyApplication.companyName}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Reference #: {selectedBusinessStrategyApplication.referenceNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Contact: {selectedBusinessStrategyApplication.contactName}
              </Typography>
              
              <FormControl fullWidth sx={{ mt: 3 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  label="Status"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {statusOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleStatusUpdate} 
            variant="contained"
            disabled={!selectedStatus}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the business strategy application for {selectedBusinessStrategyApplication?.companyName}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          severity={snackbar.severity as any} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BusinessStrategy;
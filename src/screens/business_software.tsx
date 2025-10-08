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
interface BusinessSoftware {
  id: string;
  companyName: string;
  email: string;
  contactName: string;
  phoneNumber: string;
  status: 'approved' | 'pending' |  'rejected';
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
const mapApiStatusToComponentStatus = (apiStatus: string): BusinessSoftware['status'] => {
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

// Map API data to BusinessSoftware interface
const mapApiDataToBusinessSoftware = (apiData: any): BusinessSoftware => {
  // Generate a unique ID if not provided
  const id = apiData.id || apiData._id || Math.random().toString(36).substr(2, 9);
  
  // Use createdAt for applied date if available
  const appliedDate = apiData.createdAt ? new Date(apiData.createdAt) : new Date();
  
  // Use updatedAt for updated date if available
  const updatedDate = apiData.updatedAt ? new Date(apiData.updatedAt) : new Date();
  
  // Generate a reference number if not provided
  const referenceNumber = apiData.referenceNumber || `BS-${Math.floor(100000 + Math.random() * 900000)}`;
  
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

const BusinessSoftwareManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [businessSoftwares, setBusinessSoftwares] = useState<BusinessSoftware[]>([]);
  const [filteredBusinessSoftwares, setFilteredBusinessSoftwares] = useState<BusinessSoftware[]>([]);
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
  const [selectedBusinessSoftware, setSelectedBusinessSoftware] = useState<BusinessSoftware | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Fetch data from API
  useEffect(() => {
    const fetchBusinessSoftwares = async () => {
      try {
        setLoading(true);
        const response = await appiledService.getAllAppliedService();
        
        // Map API response to BusinessSoftware objects
        const mappedBusinessSoftwares = response.map((item: any) => mapApiDataToBusinessSoftware(item));
        
        setBusinessSoftwares(mappedBusinessSoftwares);
        setFilteredBusinessSoftwares(mappedBusinessSoftwares);
        setError(null);
      } catch (err) {
        console.error('Error fetching business softwares:', err);
        setError('Failed to load business softwares. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessSoftwares();
  }, []);

  const filterStatusOptions = ['all', 'approved', 'pending', 'in-review', 'rejected'];

  // Filter business softwares based on filter options and search term
  useEffect(() => {
    let filtered = businessSoftwares;

    // Filter by status
    if (filterOptions.status !== 'all') {
      filtered = filtered.filter(businessSoftware => 
        businessSoftware.status === filterOptions.status
      );
    }

    // Filter by date range
    if (filterOptions.dateRange.start) {
      filtered = filtered.filter(businessSoftware => 
        businessSoftware.appliedDate >= filterOptions.dateRange.start!
      );
    }
    if (filterOptions.dateRange.end) {
      filtered = filtered.filter(businessSoftware => 
        businessSoftware.appliedDate <= filterOptions.dateRange.end!
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(businessSoftware =>
        businessSoftware.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        businessSoftware.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        businessSoftware.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        businessSoftware.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBusinessSoftwares(filtered);
  }, [businessSoftwares, filterOptions, searchTerm]);

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

  const getStatusColor = (status: BusinessSoftware['status']): string => {
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

  const getStatusIcon = (status: BusinessSoftware['status']) => {
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

  const handleStatusUpdateClick = (businessSoftware: BusinessSoftware) => {
    setSelectedBusinessSoftware(businessSoftware);
    setSelectedStatus(businessSoftware.status);
    setStatusDialogOpen(true);
  };

  const handleDeleteClick = (businessSoftware: BusinessSoftware) => {
    setSelectedBusinessSoftware(businessSoftware);
    setDeleteDialogOpen(true);
  };

  const handleStatusUpdate = async () => {
    try {
      if (!selectedBusinessSoftware || !selectedStatus) return;
      
      await appiledService.updateAppliedService(selectedBusinessSoftware.id, { status: selectedStatus });
      
      // Refresh the list
      const response = await appiledService.getAllAppliedService();
      const mappedBusinessSoftwares = response.map((item: any) => mapApiDataToBusinessSoftware(item));
      setBusinessSoftwares(mappedBusinessSoftwares);
      
      setSnackbar({ open: true, message: 'Status updated successfully', severity: 'success' });
      setStatusDialogOpen(false);
    } catch (error) {
      console.error('Error updating status:', error);
      setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!selectedBusinessSoftware) return;
      
      await appiledService.deleteAppliedService(selectedBusinessSoftware.id);
      
      // Refresh the list
      const response = await appiledService.getAllAppliedService();
      const mappedBusinessSoftwares = response.map((item: any) => mapApiDataToBusinessSoftware(item));
      setBusinessSoftwares(mappedBusinessSoftwares);
      
      setSnackbar({ open: true, message: 'Business software deleted successfully', severity: 'success' });
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting business software:', error);
      setSnackbar({ open: true, message: 'Failed to delete business software', severity: 'error' });
    }
  };

  const calculateProgress = (status: BusinessSoftware['status']): number => {
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
        <Typography variant="h6">Loading business softwares...</Typography>
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
          Business Software Applications
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage all your business software applications
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
          Showing {filteredBusinessSoftwares.length} of {businessSoftwares.length} applications
        </Typography>
      </Box>

      {/* Business Softwares List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {filteredBusinessSoftwares.length === 0 ? (
          <Paper 
            elevation={1} 
            sx={{ 
              p: 8, 
              textAlign: 'center',
              backgroundColor: theme.palette.background.paper
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No business software applications found matching your filters.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredBusinessSoftwares.map((businessSoftware) => (
              <Grid item xs={12} md={6} lg={4} key={businessSoftware.id}>
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
                          {businessSoftware.companyName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          #{businessSoftware.referenceNumber}
                        </Typography>
                      </Box>
                      <Chip
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <span>{getStatusIcon(businessSoftware.status)}</span>
                            <span>{businessSoftware.status.toUpperCase()}</span>
                          </Box>
                        }
                        sx={{ 
                          backgroundColor: getStatusColor(businessSoftware.status),
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
                          {businessSoftware.contactName}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          Email:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {businessSoftware.email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          Phone:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {businessSoftware.phoneNumber}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          Applied Date:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(businessSoftware.appliedDate)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          Last Updated:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(businessSoftware.updatedDate)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Progress Bar */}
                    <Box sx={{ mb: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={calculateProgress(businessSoftware.status)} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          mb: 1 
                        }}
                      />
                      <Typography variant="body2" color="text.secondary" align="right">
                        {calculateProgress(businessSoftware.status)}% Complete
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
                        onClick={() => handleStatusUpdateClick(businessSoftware)}
                        fullWidth={isMobile}
                      >
                        Update Status
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        size="small"
                        onClick={() => handleDeleteClick(businessSoftware)}
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
          {selectedBusinessSoftware && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                Update status for <strong>{selectedBusinessSoftware.companyName}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Reference #: {selectedBusinessSoftware.referenceNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Contact: {selectedBusinessSoftware.contactName}
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
            Are you sure you want to delete the business software application for {selectedBusinessSoftware?.companyName}?
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

export default BusinessSoftwareManagement;
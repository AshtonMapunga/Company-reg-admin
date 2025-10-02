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
interface MicrosoftServiceApplication {
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
const mapApiStatusToComponentStatus = (apiStatus: string): MicrosoftServiceApplication['status'] => {
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

// Map API data to MicrosoftServiceApplication interface
const mapApiDataToMicrosoftServiceApplication = (apiData: any): MicrosoftServiceApplication => {
  // Generate a unique ID if not provided
  const id = apiData.id || apiData._id || Math.random().toString(36).substr(2, 9);
  
  // Use createdAt for applied date if available
  const appliedDate = apiData.createdAt ? new Date(apiData.createdAt) : new Date();
  
  // Use updatedAt for updated date if available
  const updatedDate = apiData.updatedAt ? new Date(apiData.updatedAt) : new Date();
  
  // Generate a reference number if not provided
  const referenceNumber = apiData.referenceNumber || `MS-${Math.floor(100000 + Math.random() * 900000)}`;
  
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

const MicrosoftServices: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [microsoftServiceApplications, setMicrosoftServiceApplications] = useState<MicrosoftServiceApplication[]>([]);
  const [filteredMicrosoftServiceApplications, setFilteredMicrosoftServiceApplications] = useState<MicrosoftServiceApplication[]>([]);
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
  const [selectedMicrosoftServiceApplication, setSelectedMicrosoftServiceApplication] = useState<MicrosoftServiceApplication | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Fetch data from API
  useEffect(() => {
    const fetchMicrosoftServiceApplications = async () => {
      try {
        setLoading(true);
        const response = await appiledService.getAllAppliedService();
        
        // Map API response to MicrosoftServiceApplication objects
        const mappedMicrosoftServiceApplications = response.map((item: any) => mapApiDataToMicrosoftServiceApplication(item));
        
        setMicrosoftServiceApplications(mappedMicrosoftServiceApplications);
        setFilteredMicrosoftServiceApplications(mappedMicrosoftServiceApplications);
        setError(null);
      } catch (err) {
        console.error('Error fetching Microsoft services applications:', err);
        setError('Failed to load Microsoft services applications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMicrosoftServiceApplications();
  }, []);

  const filterStatusOptions = ['all', 'approved', 'pending', 'in-review', 'rejected'];

  // Filter Microsoft service applications based on filter options and search term
  useEffect(() => {
    let filtered = microsoftServiceApplications;

    // Filter by status
    if (filterOptions.status !== 'all') {
      filtered = filtered.filter(microsoftServiceApplication => 
        microsoftServiceApplication.status === filterOptions.status
      );
    }

    // Filter by date range
    if (filterOptions.dateRange.start) {
      filtered = filtered.filter(microsoftServiceApplication => 
        microsoftServiceApplication.appliedDate >= filterOptions.dateRange.start!
      );
    }
    if (filterOptions.dateRange.end) {
      filtered = filtered.filter(microsoftServiceApplication => 
        microsoftServiceApplication.appliedDate <= filterOptions.dateRange.end!
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(microsoftServiceApplication =>
        microsoftServiceApplication.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        microsoftServiceApplication.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        microsoftServiceApplication.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        microsoftServiceApplication.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMicrosoftServiceApplications(filtered);
  }, [microsoftServiceApplications, filterOptions, searchTerm]);

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

  const getStatusColor = (status: MicrosoftServiceApplication['status']): string => {
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

  const getStatusIcon = (status: MicrosoftServiceApplication['status']) => {
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

  const handleStatusUpdateClick = (microsoftServiceApplication: MicrosoftServiceApplication) => {
    setSelectedMicrosoftServiceApplication(microsoftServiceApplication);
    setSelectedStatus(microsoftServiceApplication.status);
    setStatusDialogOpen(true);
  };

  const handleDeleteClick = (microsoftServiceApplication: MicrosoftServiceApplication) => {
    setSelectedMicrosoftServiceApplication(microsoftServiceApplication);
    setDeleteDialogOpen(true);
  };

  const handleStatusUpdate = async () => {
    try {
      if (!selectedMicrosoftServiceApplication || !selectedStatus) return;
      
      await appiledService.updateAppliedService(selectedMicrosoftServiceApplication.id, { status: selectedStatus });
      
      // Refresh the list
      const response = await appiledService.getAllAppliedService();
      const mappedMicrosoftServiceApplications = response.map((item: any) => mapApiDataToMicrosoftServiceApplication(item));
      setMicrosoftServiceApplications(mappedMicrosoftServiceApplications);
      
      setSnackbar({ open: true, message: 'Status updated successfully', severity: 'success' });
      setStatusDialogOpen(false);
    } catch (error) {
      console.error('Error updating status:', error);
      setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!selectedMicrosoftServiceApplication) return;
      
      await appiledService.deleteAppliedService(selectedMicrosoftServiceApplication.id);
      
      // Refresh the list
      const response = await appiledService.getAllAppliedService();
      const mappedMicrosoftServiceApplications = response.map((item: any) => mapApiDataToMicrosoftServiceApplication(item));
      setMicrosoftServiceApplications(mappedMicrosoftServiceApplications);
      
      setSnackbar({ open: true, message: 'Microsoft service application deleted successfully', severity: 'success' });
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting Microsoft service application:', error);
      setSnackbar({ open: true, message: 'Failed to delete Microsoft service application', severity: 'error' });
    }
  };

  const calculateProgress = (status: MicrosoftServiceApplication['status']): number => {
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
        <Typography variant="h6">Loading Microsoft services applications...</Typography>
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
          Microsoft Services Applications
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage all your Microsoft services applications
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
          Showing {filteredMicrosoftServiceApplications.length} of {microsoftServiceApplications.length} applications
        </Typography>
      </Box>

      {/* Microsoft Services Applications List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {filteredMicrosoftServiceApplications.length === 0 ? (
          <Paper 
            elevation={1} 
            sx={{ 
              p: 8, 
              textAlign: 'center',
              backgroundColor: theme.palette.background.paper
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No Microsoft services applications found matching your filters.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredMicrosoftServiceApplications.map((microsoftServiceApplication) => (
              <Grid item xs={12} md={6} lg={4} key={microsoftServiceApplication.id}>
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
                          {microsoftServiceApplication.companyName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          #{microsoftServiceApplication.referenceNumber}
                        </Typography>
                      </Box>
                      <Chip
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <span>{getStatusIcon(microsoftServiceApplication.status)}</span>
                            <span>{microsoftServiceApplication.status.toUpperCase()}</span>
                          </Box>
                        }
                        sx={{ 
                          backgroundColor: getStatusColor(microsoftServiceApplication.status),
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
                          {microsoftServiceApplication.contactName}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          Email:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {microsoftServiceApplication.email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          Phone:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {microsoftServiceApplication.phoneNumber}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          Applied Date:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(microsoftServiceApplication.appliedDate)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          Last Updated:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(microsoftServiceApplication.updatedDate)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Progress Bar */}
                    <Box sx={{ mb: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={calculateProgress(microsoftServiceApplication.status)} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          mb: 1 
                        }}
                      />
                      <Typography variant="body2" color="text.secondary" align="right">
                        {calculateProgress(microsoftServiceApplication.status)}% Complete
                      </Typography>
                    </Box>

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
                        startIcon={<UpdateIcon />}
                        size="small"
                        onClick={() => handleStatusUpdateClick(microsoftServiceApplication)}
                        fullWidth={isMobile}
                      >
                        Update Status
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        size="small"
                        onClick={() => handleDeleteClick(microsoftServiceApplication)}
                        fullWidth={isMobile}
                      >
                        Delete
                      </Button>
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
          {selectedMicrosoftServiceApplication && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                Update status for <strong>{selectedMicrosoftServiceApplication.companyName}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Reference #: {selectedMicrosoftServiceApplication.referenceNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Contact: {selectedMicrosoftServiceApplication.contactName}
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
            Are you sure you want to delete the Microsoft services application for {selectedMicrosoftServiceApplication?.companyName}?
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

export default MicrosoftServices;
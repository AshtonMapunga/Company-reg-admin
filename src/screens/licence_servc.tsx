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
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import LicenceService from '../services/licence_service';

// Types
interface Licence {
  id: string;
  companyName: string;
  email: string;
  address: string;
  contactPerson: string;
  phoneNumber: string;
  businessType: string;
  premisesSize: string;
  targetMarket: string;
  status: 'approved' | 'pending' | 'in-review' | 'rejected';
  appliedDate: Date;
  updatedDate: Date;
  referenceNumber: string;
}

interface FilterOptions {
  businessType: string;
  status: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

// Map API status to component status
const mapApiStatusToComponentStatus = (apiStatus: string): Licence['status'] => {
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

// Map API data to Licence interface
const mapApiDataToLicence = (apiData: any): Licence => {
  // Generate a unique ID if not provided
  const id = apiData.id || apiData._id || Math.random().toString(36).substr(2, 9);
  
  // Use createdAt for applied date if available
  const appliedDate = apiData.createdAt ? new Date(apiData.createdAt) : new Date();
  
  // Use updatedAt for updated date if available
  const updatedDate = apiData.updatedAt ? new Date(apiData.updatedAt) : new Date();
  
  // Generate a reference number if not provided
  const referenceNumber = apiData.referenceNumber || `LIC-${Math.floor(100000 + Math.random() * 900000)}`;
  
  // Map status
  const status = mapApiStatusToComponentStatus(apiData.status || 'pending');
  
  return {
    id,
    companyName: apiData.companyName || 'Unknown Company',
    email: apiData.email || '',
    address: apiData.address || '',
    contactPerson: apiData.contactPerson || '',
    phoneNumber: apiData.phoneNumber || '',
    businessType: apiData.businessType || 'GENERAL',
    premisesSize: apiData.premisesSize || '',
    targetMarket: apiData.targetMarket || '',
    status,
    appliedDate,
    updatedDate,
    referenceNumber
  };
};

const LicenceManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [licences, setLicences] = useState<Licence[]>([]);
  const [filteredLicences, setFilteredLicences] = useState<Licence[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    businessType: 'all',
    status: 'all',
    dateRange: {
      start: null,
      end: null
    }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLicence, setSelectedLicence] = useState<Licence | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch data from API
  useEffect(() => {
    const fetchLicences = async () => {
      try {
        setLoading(true);
        const response = await LicenceService.getAllLicenceService();
        
        // Map API response to Licence objects
        const mappedLicences = response.map((item: any) => mapApiDataToLicence(item));
        
        setLicences(mappedLicences);
        setFilteredLicences(mappedLicences);
        setError(null);
      } catch (err) {
        console.error('Error fetching licences:', err);
        setError('Failed to load licences. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLicences();
  }, []);

  // Get unique business types for filter dropdown
  const businessTypes = ['all', ...new Set(licences.map(licence => licence.businessType))];
  const statusOptions = ['all', 'approved', 'pending', 'in-review', 'rejected'];

  // Filter licences based on filter options and search term
  useEffect(() => {
    let filtered = licences;

    // Filter by business type
    if (filterOptions.businessType !== 'all') {
      filtered = filtered.filter(licence => 
        licence.businessType === filterOptions.businessType
      );
    }

    // Filter by status
    if (filterOptions.status !== 'all') {
      filtered = filtered.filter(licence => 
        licence.status === filterOptions.status
      );
    }

    // Filter by date range
    if (filterOptions.dateRange.start) {
      filtered = filtered.filter(licence => 
        licence.appliedDate >= filterOptions.dateRange.start!
      );
    }
    if (filterOptions.dateRange.end) {
      filtered = filtered.filter(licence => 
        licence.appliedDate <= filterOptions.dateRange.end!
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(licence =>
        licence.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        licence.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        licence.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        licence.businessType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLicences(filtered);
  }, [licences, filterOptions, searchTerm]);

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
      businessType: 'all',
      status: 'all',
      dateRange: {
        start: null,
        end: null
      }
    });
    setSearchTerm('');
  };

  const getStatusColor = (status: Licence['status']): string => {
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

  const getStatusIcon = (status: Licence['status']) => {
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

  const handleEditClick = (licence: Licence) => {
    setSelectedLicence(licence);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (licence: Licence) => {
    setSelectedLicence(licence);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async (formData: any) => {
    try {
      if (!selectedLicence) return;
      
      await LicenceService.updateAppliedService(selectedLicence.id, formData);
      
      // Refresh the list
      const response = await LicenceService.getAllLicenceService();
      const mappedLicences = response.map((item: any) => mapApiDataToLicence(item));
      setLicences(mappedLicences);
      
      setSnackbar({ open: true, message: 'Licence updated successfully', severity: 'success' });
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating licence:', error);
      setSnackbar({ open: true, message: 'Failed to update licence', severity: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!selectedLicence) return;
      
      await LicenceService.deleteAppliedService(selectedLicence.id);
      
      // Refresh the list
      const response = await LicenceService.getAllLicenceService();
      const mappedLicences = response.map((item: any) => mapApiDataToLicence(item));
      setLicences(mappedLicences);
      
      setSnackbar({ open: true, message: 'Licence deleted successfully', severity: 'success' });
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting licence:', error);
      setSnackbar({ open: true, message: 'Failed to delete licence', severity: 'error' });
    }
  };

  const calculateProgress = (status: Licence['status']): number => {
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
        <Typography variant="h6">Loading licences...</Typography>
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
          Licence Applications
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage all your business licence applications
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
              placeholder="Search by company, reference, or contact..."
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

          {/* Business Type Filter */}
          <Grid item xs={12} md={6} lg={3}>
            <TextField
              fullWidth
              select
              label="Business Type"
              value={filterOptions.businessType}
              onChange={(e) => handleFilterChange('businessType', e.target.value)}
            >
              {businessTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {type === 'all' ? 'All Business Types' : type}
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
          Showing {filteredLicences.length} of {licences.length} licence applications
        </Typography>
      </Box>

      {/* Licences List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {filteredLicences.length === 0 ? (
          <Paper 
            elevation={1} 
            sx={{ 
              p: 8, 
              textAlign: 'center',
              backgroundColor: theme.palette.background.paper
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No licence applications found matching your filters.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredLicences.map((licence) => (
              <Grid item xs={12} md={6} lg={4} key={licence.id}>
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
                          {licence.companyName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          #{licence.referenceNumber}
                        </Typography>
                      </Box>
                      <Chip
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <span>{getStatusIcon(licence.status)}</span>
                            <span>{licence.status.toUpperCase()}</span>
                          </Box>
                        }
                        sx={{ 
                          backgroundColor: getStatusColor(licence.status),
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
                          Business Type:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {licence.businessType}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          Contact Person:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {licence.contactPerson}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          Applied Date:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(licence.appliedDate)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          Premises Size:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {licence.premisesSize}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Progress Bar */}
                    <Box sx={{ mb: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={calculateProgress(licence.status)} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          mb: 1 
                        }}
                      />
                      <Typography variant="body2" color="text.secondary" align="right">
                        {calculateProgress(licence.status)}% Complete
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
                        startIcon={<EditIcon />}
                        size="small"
                        onClick={() => handleEditClick(licence)}
                        fullWidth={isMobile}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        size="small"
                        onClick={() => handleDeleteClick(licence)}
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Licence Application</DialogTitle>
        <DialogContent>
          {selectedLicence && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    defaultValue={selectedLicence.companyName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    defaultValue={selectedLicence.email}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    defaultValue={selectedLicence.address}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Person"
                    defaultValue={selectedLicence.contactPerson}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    defaultValue={selectedLicence.phoneNumber}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Business Type"
                    defaultValue={selectedLicence.businessType}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Premises Size"
                    defaultValue={selectedLicence.premisesSize}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Target Market"
                    defaultValue={selectedLicence.targetMarket}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => selectedLicence && handleEditSubmit(selectedLicence)} 
            variant="contained"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the licence application for {selectedLicence?.companyName}?
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

export default LicenceManagement;
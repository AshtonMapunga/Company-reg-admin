import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Alert,
  Snackbar,
  MenuItem,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  Update as UpdateIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import prazService from '../../services/praz_regi_serv'; 

// Types
interface PrazApplication {
  id: string;
  companyName: string;
  businessType: string;
  registrationNumber: string;
  status: 'Approved' | 'Pending' | 'Rejected' ;
  appliedDate: Date;
  contactEmail: string;
  contactPhone: string;
  address: string;
  taxNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const statusOptions = [
  { value: 'Approved', label: 'Approved', color: 'success' },
  { value: 'Pending', label: 'Pending', color: 'warning' },
  { value: 'Rejected', label: 'Rejected', color: 'error' }
];

const businessTypes = [
  'Construction',
  'Goods Supply',
  'Services',
  'Consultancy',
  'Manufacturing',
  'IT Services',
  'Other'
];

// Map API data to PrazApplication interface
const mapApiDataToApplication = (apiData: any): PrazApplication => {
  return {
    id: apiData.id || apiData._id || Math.random().toString(36).substr(2, 9),
    companyName: apiData.companyName || 'Unknown Company',
    businessType: apiData.businessType || 'Other',
    registrationNumber: apiData.registrationNumber || `PRAZ-${Math.floor(100000 + Math.random() * 900000)}`,
    status: (apiData.status?.toLowerCase() as PrazApplication['status']) || 'Pending',
    appliedDate: apiData.appliedDate ? new Date(apiData.appliedDate) : new Date(),
    contactEmail: apiData.contactEmail || '',
    contactPhone: apiData.contactPhone || '',
    address: apiData.address || '',
    taxNumber: apiData.taxNumber || '',
    createdAt: apiData.createdAt ? new Date(apiData.createdAt) : new Date(),
    updatedAt: apiData.updatedAt ? new Date(apiData.updatedAt) : new Date()
  };
};

const PrazRegistration: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [applications, setApplications] = useState<PrazApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<PrazApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<PrazApplication | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Edit form state
  const [editFormData, setEditFormData] = useState<Partial<PrazApplication>>({});

  // Fetch data from API
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await prazService.getAllPrazService();
      
      // Map API response to Application objects
      const mappedApplications = response.map((item: any) => mapApiDataToApplication(item));
      
      setApplications(mappedApplications);
      setFilteredApplications(mappedApplications);
      setError(null);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Filter applications based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredApplications(applications);
    } else {
      const filtered = applications.filter(app =>
        app.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.businessType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.contactPhone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredApplications(filtered);
    }
  }, [searchTerm, applications]);

  const handleStatusUpdateClick = (application: PrazApplication) => {
    setSelectedApplication(application);
    setSelectedStatus(application.status);
    setStatusDialogOpen(true);
  };

  const handleDeleteClick = (application: PrazApplication) => {
    setSelectedApplication(application);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (application: PrazApplication) => {
    setSelectedApplication(application);
    setEditFormData({
      companyName: application.companyName || '',
      businessType: application.businessType || '',
      registrationNumber: application.registrationNumber || '',
      contactEmail: application.contactEmail || '',
      contactPhone: application.contactPhone || '',
      address: application.address || '',
      taxNumber: application.taxNumber || '',
      status: application.status || 'Pending'
    });
    setEditDialogOpen(true);
  };

  const handleViewClick = (application: PrazApplication) => {
    setSelectedApplication(application);
    setViewDialogOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedApplication || !selectedStatus) return;
    
    try {
      setUpdateLoading(true);
      await prazService.updateAppliedService(selectedApplication.id, { 
        ...selectedApplication,
        status: selectedStatus 
      });
      setStatusDialogOpen(false);
      setSuccess('Status updated successfully!');
      fetchApplications(); // Refresh the list
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedApplication) return;
    
    try {
      setUpdateLoading(true);
      await prazService.updateAppliedService(selectedApplication.id, editFormData);
      setEditDialogOpen(false);
      setSuccess('Application updated successfully!');
      fetchApplications(); // Refresh the list
    } catch (err) {
      console.error('Error updating application:', err);
      setError('Failed to update application. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedApplication) return;
    
    try {
      setDeleteLoading(true);
      await prazService.deleteAppliedService(selectedApplication.id);
      setDeleteDialogOpen(false);
      setSuccess('Application deleted successfully!');
      fetchApplications(); // Refresh the list
    } catch (err) {
      console.error('Error deleting application:', err);
      setError('Failed to delete application. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleInputChange = (field: keyof PrazApplication, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Approved':
        return theme.palette.success.main;
      case 'Pending':
        return theme.palette.warning.main;
    
      case 'Rejected':
        return theme.palette.error.main;
      default:
        return theme.palette.warning.main;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircleIcon sx={{ color: theme.palette.success.main, mr: 1 }} />;
      case 'Rejected':
        return <CancelIcon sx={{ color: theme.palette.error.main, mr: 1 }} />;
      default:
        return <UpdateIcon sx={{ color: theme.palette.warning.main, mr: 1 }} />;
    }
  };

  const formatDate = (date: Date): string => {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
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
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading PRAZ applications...</Typography>
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
      {/* Notifications */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      {/* Header and Search Section */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 3, 
          mb: 3,
          backgroundColor: theme.palette.background.paper
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            PRAZ Registration Applications
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={fetchApplications}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>
        
        <TextField
          fullWidth
          label="Search PRAZ Applications"
          placeholder="Search by company name, registration number, business type, email or phone..."
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
                  onClick={clearSearch}
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Paper>

      {/* Results Count */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredApplications.length} of {applications.length} applications
        </Typography>
      </Box>

      {/* Applications List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {filteredApplications.length === 0 ? (
          <Paper 
            elevation={1} 
            sx={{ 
              p: 8, 
              textAlign: 'center',
              backgroundColor: theme.palette.background.paper
            }}
          >
            <Typography variant="h6" color="text.secondary">
              {applications.length === 0 
                ? 'No PRAZ registration applications found.' 
                : 'No applications match your search criteria.'}
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredApplications.map((application) => (
              <Grid item xs={12} key={application.id}>
                <Card 
                  sx={{ 
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    borderLeft: `4px solid ${getStatusColor(application.status)}`
                  }}
                >
                  <CardContent sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    gap: 2,
                    width: '100%'
                  }}>
                    {/* Application Info */}
                    <Box sx={{ flex: 1, width: '100%' }}>
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
                            {application.companyName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            #{application.registrationNumber}
                          </Typography>
                          {application.taxNumber && (
                            <Typography variant="body2" color="text.secondary">
                              TAX: {application.taxNumber}
                            </Typography>
                          )}
                        </Box>
                        <Chip
                          label={application.status.toUpperCase()}
                          sx={{ 
                            backgroundColor: getStatusColor(application.status),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                          size="small"
                        />
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" fontWeight="medium">
                            Business Type:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {application.businessType}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" fontWeight="medium">
                            Applied Date:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(application.appliedDate)}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" fontWeight="medium">
                            Contact Email:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {application.contactEmail || 'N/A'}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" fontWeight="medium">
                            Contact Phone:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {application.contactPhone || 'N/A'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      flexWrap: 'wrap',
                      alignSelf: isMobile ? 'flex-end' : 'center'
                    }}>
                      <Tooltip title="View Details">
                        <IconButton
                          color="info"
                          onClick={() => handleViewClick(application)}
                          aria-label="View"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Update Status">
                        <IconButton
                          color="primary"
                          onClick={() => handleStatusUpdateClick(application)}
                          aria-label="Update Status"
                        >
                          <UpdateIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Edit Application">
                        <IconButton
                          color="warning"
                          onClick={() => handleEditClick(application)}
                          aria-label="Edit"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Delete Application">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(application)}
                          aria-label="Delete"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
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
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {selectedApplication && getStatusIcon(selectedStatus)}
            Update Application Status
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                Update status for <strong>{selectedApplication.companyName}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Application ID: {selectedApplication.id}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Registration #: {selectedApplication.registrationNumber}
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
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip 
                          label={option.label} 
                          size="small" 
                          sx={{ 
                            backgroundColor: getStatusColor(option.value),
                            color: 'white',
                            mr: 1
                          }} 
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)} disabled={updateLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleStatusUpdate} 
            variant="contained"
            disabled={!selectedStatus || updateLoading || selectedStatus === selectedApplication?.status}
            startIcon={updateLoading ? <CircularProgress size={20} /> : null}
          >
            {updateLoading ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Application Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EditIcon sx={{ mr: 1 }} />
            Edit PRAZ Application
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Application ID: {selectedApplication.id}
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    value={editFormData.companyName || ''}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Business Type"
                    value={editFormData.businessType || ''}
                    onChange={(e) => handleInputChange('businessType', e.target.value)}
                    margin="normal"
                    required
                  >
                    {businessTypes.map(type => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Registration Number"
                    value={editFormData.registrationNumber || ''}
                    onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={editFormData.status || ''}
                      label="Status"
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      {statusOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Email"
                    value={editFormData.contactEmail || ''}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    margin="normal"
                    type="email"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Phone"
                    value={editFormData.contactPhone || ''}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    multiline
                    rows={3}
                    value={editFormData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tax Number (Optional)"
                    value={editFormData.taxNumber || ''}
                    onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} disabled={updateLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleEditSubmit} 
            variant="contained"
            disabled={updateLoading}
            startIcon={updateLoading ? <CircularProgress size={20} /> : null}
          >
            {updateLoading ? 'Updating...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Application Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <VisibilityIcon sx={{ mr: 1 }} />
            PRAZ Application Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ mb: 3, p: 2, backgroundColor: theme.palette.background.default, borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" fontWeight="medium">Company Name:</Typography>
                    <Typography variant="body1">{selectedApplication.companyName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" fontWeight="medium">Status:</Typography>
                    <Chip 
                      label={selectedApplication.status.toUpperCase()} 
                      sx={{ 
                        backgroundColor: getStatusColor(selectedApplication.status),
                        color: 'white'
                      }} 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" fontWeight="medium">Registration Number:</Typography>
                    <Typography variant="body1">{selectedApplication.registrationNumber}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" fontWeight="medium">Business Type:</Typography>
                    <Typography variant="body1">{selectedApplication.businessType}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" fontWeight="medium">Contact Email:</Typography>
                    <Typography variant="body1">{selectedApplication.contactEmail || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" fontWeight="medium">Contact Phone:</Typography>
                    <Typography variant="body1">{selectedApplication.contactPhone || 'N/A'}</Typography>
                  </Grid>
                  {selectedApplication.taxNumber && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" fontWeight="medium">Tax Number:</Typography>
                      <Typography variant="body1">{selectedApplication.taxNumber}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>

              {/* Application Details Table */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Application Information
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableBody>
                      {selectedApplication.address && (
                        <TableRow>
                          <TableCell component="th" scope="row">
                            <Typography variant="body2" fontWeight="medium">Address:</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{selectedApplication.address}</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell component="th" scope="row">
                          <Typography variant="body2" fontWeight="medium">Applied Date:</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatDate(selectedApplication.appliedDate)}</Typography>
                        </TableCell>
                      </TableRow>
                      {selectedApplication.createdAt && (
                        <TableRow>
                          <TableCell component="th" scope="row">
                            <Typography variant="body2" fontWeight="medium">Created On:</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{formatDate(selectedApplication.createdAt)}</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                      {selectedApplication.updatedAt && (
                        <TableRow>
                          <TableCell component="th" scope="row">
                            <Typography variant="body2" fontWeight="medium">Last Updated:</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{formatDate(selectedApplication.updatedAt)}</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell component="th" scope="row">
                          <Typography variant="body2" fontWeight="medium">Application ID:</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{selectedApplication.id}</Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box>
              <Alert severity="warning" sx={{ mb: 2 }}>
                This action cannot be undone.
              </Alert>
              <Typography>
                Are you sure you want to delete the PRAZ registration application for <strong>{selectedApplication.companyName}</strong>?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Application ID: {selectedApplication.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Registration #: {selectedApplication.registrationNumber}
              </Typography>
              {selectedApplication.taxNumber && (
                <Typography variant="body2" color="text.secondary">
                  TAX #: {selectedApplication.taxNumber}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PrazRegistration;
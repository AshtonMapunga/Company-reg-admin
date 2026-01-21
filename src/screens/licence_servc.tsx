import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Chip,
  Alert,
  Container,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  Snackbar,
  Grid
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Update as UpdateIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import LicenceService from '../services/licence_service';

interface LicenceApplication {
  id: string;
  _id?: string;
  companyName: string;
  email: string;
  address: string;
  contactPerson: string;
  phoneNumber: string;
  businessType: string;
  premisesSize: string;
  targetMarket: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'In-Review';
  createdAt: string;
  updatedAt: string;
}

const statusOptions = [
  { value: 'Approved', label: 'Approved', color: 'success' },
  { value: 'Pending', label: 'Pending', color: 'warning' },
  { value: 'Rejected', label: 'Rejected', color: 'error' },
  { value: 'In-Review', label: 'In Review', color: 'info' }
];

const businessTypes = [
  'Retail',
  'Manufacturing',
  'Services',
  'Consultancy',
  'Hospitality',
  'Construction',
  'Transportation',
  'Healthcare',
  'Education',
  'Technology',
  'Other'
];

const mapApiDataToApplication = (apiData: any): LicenceApplication => {
  return {
    id: apiData.id || apiData._id || Math.random().toString(36).substr(2, 9),
    _id: apiData._id,
    companyName: apiData.companyName || 'Unknown Company',
    email: apiData.email || '',
    address: apiData.address || '',
    contactPerson: apiData.contactPerson || '',
    phoneNumber: apiData.phoneNumber || '',
    businessType: apiData.businessType || 'Other',
    premisesSize: apiData.premisesSize || '',
    targetMarket: apiData.targetMarket || '',
    status: apiData.status || 'Pending',
    createdAt: apiData.createdAt || new Date().toISOString(),
    updatedAt: apiData.updatedAt || new Date().toISOString()
  };
};

const LicenceApplications: React.FC = () => {
  const [applications, setApplications] = useState<LicenceApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<LicenceApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<LicenceApplication | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Edit form state
  const [editFormData, setEditFormData] = useState<Partial<LicenceApplication>>({});

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await LicenceService.getAllLicenceService();
      const mappedApplications = Array.isArray(data) 
        ? data.map((item: any) => mapApiDataToApplication(item))
        : [];
      setApplications(mappedApplications);
      setFilteredApplications(mappedApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Failed to fetch applications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Filter applications based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredApplications(applications);
    } else {
      const filtered = applications.filter(app =>
        app.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.businessType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredApplications(filtered);
    }
  }, [searchTerm, applications]);

  const handleStatusUpdateClick = (application: LicenceApplication) => {
    setSelectedApplication(application);
    setSelectedStatus(application.status);
    setStatusDialogOpen(true);
  };

  const handleDeleteClick = (application: LicenceApplication) => {
    setSelectedApplication(application);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (application: LicenceApplication) => {
    setSelectedApplication(application);
    setEditFormData({
      companyName: application.companyName || '',
      email: application.email || '',
      address: application.address || '',
      contactPerson: application.contactPerson || '',
      phoneNumber: application.phoneNumber || '',
      businessType: application.businessType || '',
      premisesSize: application.premisesSize || '',
      targetMarket: application.targetMarket || '',
      status: application.status || 'Pending'
    });
    setEditDialogOpen(true);
  };

  const handleViewClick = (application: LicenceApplication) => {
    setSelectedApplication(application);
    setViewDialogOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedApplication || !selectedStatus) return;
    
    try {
      setUpdateLoading(true);
      const statusData = { status: selectedStatus };
      await LicenceService.updateStatusService(selectedApplication.id, statusData);
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
      await LicenceService.updateAppliedService(selectedApplication.id, editFormData);
      setEditDialogOpen(false);
      setSuccess('Licence application updated successfully!');
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
      await LicenceService.deleteAppliedService(selectedApplication.id);
      setDeleteDialogOpen(false);
      setSuccess('Licence application deleted successfully!');
      fetchApplications(); // Refresh the list
    } catch (err) {
      console.error('Error deleting application:', err);
      setError('Failed to delete application. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleInputChange = (field: keyof LicenceApplication, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Approved':
        return '#4caf50';
      case 'Pending':
        return '#ff9800';
      case 'In-Review':
        return '#2196f3';
      case 'Rejected':
        return '#f44336';
      default:
        return '#ff9800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircleIcon sx={{ color: '#4caf50', mr: 1 }} />;
      case 'Rejected':
        return <CancelIcon sx={{ color: '#f44336', mr: 1 }} />;
      default:
        return <UpdateIcon sx={{ color: '#ff9800', mr: 1 }} />;
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading licence applications...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
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

      {/* Header Section */}
      <Box mb={4}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Licence Applications
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

        <Typography variant="body1" color="text.secondary" gutterBottom>
          Manage licence applications and their status
        </Typography>

        {/* Search Bar */}
        <Paper elevation={1} sx={{ p: 2, mb: 3, mt: 3 }}>
          <TextField
            fullWidth
            label="Search Applications"
            placeholder="Search by company name, contact person, email, phone, or business type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
              ),
              endAdornment: searchTerm && (
                <IconButton
                  size="small"
                  onClick={clearSearch}
                >
                  <ClearIcon />
                </IconButton>
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
      </Box>

      {/* Applications Table */}
      <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden', mb: 4 }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label="licence applications table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>
                  Company Name
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>
                  Contact Person
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>
                  Email
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>
                  Phone Number
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>
                  Business Type
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredApplications.map((application) => (
                <TableRow 
                  key={application.id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" fontWeight="medium">
                      {application.companyName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {application.contactPerson}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{application.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {application.phoneNumber || 'N/A'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{application.businessType}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={application.status}
                      sx={{ 
                        backgroundColor: getStatusColor(application.status),
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          color="info"
                          size="small"
                          onClick={() => handleViewClick(application)}
                          aria-label="View"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Update Status">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleStatusUpdateClick(application)}
                          aria-label="Update Status"
                        >
                          <UpdateIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Edit Application">
                        <IconButton
                          color="warning"
                          size="small"
                          onClick={() => handleEditClick(application)}
                          aria-label="Edit"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Delete Application">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDeleteClick(application)}
                          aria-label="Delete"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredApplications.length === 0 && (
          <Box textAlign="center" py={8}>
            <Typography variant="body1" color="text.secondary">
              {applications.length === 0 
                ? 'No licence applications found.' 
                : 'No applications match your search criteria.'}
            </Typography>
          </Box>
        )}
      </Paper>

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
                Contact Person: {selectedApplication.contactPerson}
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
            Edit Licence Application
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
                    label="Contact Person"
                    value={editFormData.contactPerson || ''}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={editFormData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    margin="normal"
                    type="email"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={editFormData.phoneNumber || ''}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Business Type</InputLabel>
                    <Select
                      value={editFormData.businessType || ''}
                      label="Business Type"
                      onChange={(e) => handleInputChange('businessType', e.target.value)}
                    >
                      {businessTypes.map(type => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
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
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    multiline
                    rows={2}
                    value={editFormData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Premises Size"
                    value={editFormData.premisesSize || ''}
                    onChange={(e) => handleInputChange('premisesSize', e.target.value)}
                    margin="normal"
                    placeholder="e.g., 500 sq ft"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Target Market"
                    value={editFormData.targetMarket || ''}
                    onChange={(e) => handleInputChange('targetMarket', e.target.value)}
                    margin="normal"
                    placeholder="e.g., Local, Regional, International"
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
            Licence Application Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{ p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight="medium" color="text.secondary" gutterBottom>
                      Company Information
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="medium">Company Name:</Typography>
                      <Typography variant="body1">{selectedApplication.companyName}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="medium">Contact Person:</Typography>
                      <Typography variant="body1">{selectedApplication.contactPerson}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="medium">Email:</Typography>
                      <Typography variant="body1">{selectedApplication.email}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="medium">Phone Number:</Typography>
                      <Typography variant="body1">{selectedApplication.phoneNumber || 'N/A'}</Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{ p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight="medium" color="text.secondary" gutterBottom>
                      Application Details
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="medium">Status:</Typography>
                      <Chip 
                        label={selectedApplication.status}
                        sx={{ 
                          backgroundColor: getStatusColor(selectedApplication.status),
                          color: 'white'
                        }} 
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="medium">Business Type:</Typography>
                      <Typography variant="body1">{selectedApplication.businessType}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="medium">Premises Size:</Typography>
                      <Typography variant="body1">{selectedApplication.premisesSize || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="medium">Target Market:</Typography>
                      <Typography variant="body1">{selectedApplication.targetMarket || 'N/A'}</Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper elevation={0} sx={{ p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight="medium" color="text.secondary" gutterBottom>
                      Address
                    </Typography>
                    <Typography variant="body1">{selectedApplication.address || 'N/A'}</Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper elevation={0} sx={{ p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight="medium" color="text.secondary" gutterBottom>
                      Timeline
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" fontWeight="medium">Applied On:</Typography>
                        <Typography variant="body2">{formatDate(selectedApplication.createdAt)}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" fontWeight="medium">Last Updated:</Typography>
                        <Typography variant="body2">{formatDate(selectedApplication.updatedAt)}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" fontWeight="medium">Application ID:</Typography>
                        <Typography variant="body2">{selectedApplication.id}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
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
                Are you sure you want to delete the licence application for <strong>{selectedApplication.companyName}</strong>?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Application ID: {selectedApplication.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Contact Person: {selectedApplication.contactPerson}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Phone: {selectedApplication.phoneNumber || 'N/A'}
              </Typography>
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
    </Container>
  );
};

export default LicenceApplications;
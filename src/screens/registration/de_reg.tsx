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
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
  Update as UpdateIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import DeregService from '../../services/company_de_registration';

// Types
interface DeregApplication {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  serviceType: string;
  status: 'Approved' | 'Pending' | 'Rejected' ;
  companyName: string;
  businessType: string;
  registrationNumber: string;
  registrationDate: string;
  positionInCompany: string;
  authorityToAct: string;
  deregistrationReason: string;
  hasOutstandingObligations: boolean;
  outstandingDetails: string;
  createdAt: string;
  updatedAt: string;
}

const statusOptions = [
  { value: 'Approved', label: 'Approved', color: 'success' },
  { value: 'Pending', label: 'Pending', color: 'warning' },
  { value: 'Rejected', label: 'Rejected', color: 'error' },
];

const businessTypes = [
  'Manufacturing',
  'Retail',
  'Services',
  'Construction',
  'Technology',
  'Agriculture',
  'Mining',
  'Finance',
  'Healthcare',
  'Other'
];

const positionsInCompany = [
  'Director',
  'CEO',
  'Managing Director',
  'Company Secretary',
  'Authorized Representative',
  'Other'
];

const deregistrationReasons = [
  'Business Closure',
  'Company Merger',
  'Restructuring',
  'Financial Difficulties',
  'Market Exit',
  'Other'
];

// Map API data to DeregApplication interface
const mapApiDataToApplication = (apiData: any): DeregApplication => {
  return {
    id: apiData.id || apiData._id || Math.random().toString(36).substr(2, 9),
    applicantName: apiData.applicantName || 'Unknown Applicant',
    applicantEmail: apiData.applicantEmail || '',
    applicantPhone: apiData.applicantPhone || '',
    serviceType: apiData.serviceType || 'Company De-Registration',
    status: (apiData.status?.toLowerCase() as DeregApplication['status']) || 'Pending',
    companyName: apiData.companyName || 'Unknown Company',
    businessType: apiData.businessType || 'Other',
    registrationNumber: apiData.registrationNumber || '',
    registrationDate: apiData.registrationDate || new Date().toISOString().split('T')[0],
    positionInCompany: apiData.positionInCompany || 'Director',
    authorityToAct: apiData.authorityToAct || '',
    deregistrationReason: apiData.deregistrationReason || '',
    hasOutstandingObligations: apiData.hasOutstandingObligations || false,
    outstandingDetails: apiData.outstandingDetails || '',
    createdAt: apiData.createdAt || new Date().toISOString(),
    updatedAt: apiData.updatedAt || new Date().toISOString()
  };
};

const CompanyDeregistration: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [applications, setApplications] = useState<DeregApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<DeregApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<DeregApplication | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Update form state
  const [updateForm, setUpdateForm] = useState({
    companyName: '',
    businessType: '',
    registrationNumber: '',
    registrationDate: '',
    positionInCompany: '',
    authorityToAct: '',
    deregistrationReason: '',
    hasOutstandingObligations: false,
    outstandingDetails: ''
  });

  // Fetch data from API
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await DeregService.getAllDeregService();
      
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
        app.applicantEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicantName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredApplications(filtered);
    }
  }, [searchTerm, applications]);

  const handleStatusUpdateClick = (application: DeregApplication) => {
    setSelectedApplication(application);
    setSelectedStatus(application.status);
    setStatusDialogOpen(true);
  };

  const handleDeleteClick = (application: DeregApplication) => {
    setSelectedApplication(application);
    setDeleteDialogOpen(true);
  };

  const handleUpdateClick = (application: DeregApplication) => {
    setSelectedApplication(application);
    setUpdateForm({
      companyName: application.companyName || '',
      businessType: application.businessType || '',
      registrationNumber: application.registrationNumber || '',
      registrationDate: application.registrationDate || '',
      positionInCompany: application.positionInCompany || '',
      authorityToAct: application.authorityToAct || '',
      deregistrationReason: application.deregistrationReason || '',
      hasOutstandingObligations: application.hasOutstandingObligations || false,
      outstandingDetails: application.outstandingDetails || ''
    });
    setUpdateDialogOpen(true);
  };

  const handleViewClick = (application: DeregApplication) => {
    setSelectedApplication(application);
    setViewDialogOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedApplication || !selectedStatus) return;
    
    try {
      setUpdateLoading(true);
      await DeregService.updateStatusService(selectedApplication.id, { status: selectedStatus });
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

  const handleDeleteConfirm = async () => {
    if (!selectedApplication) return;
    
    try {
      setDeleteLoading(true);
      await DeregService.deleteAppliedService(selectedApplication.id);
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

  const handleUpdateConfirm = async () => {
    if (!selectedApplication) return;
    
    try {
      setUpdateLoading(true);
      const updateData = {
        ...updateForm,
        // Include other fields that might be required by your API
        applicantName: selectedApplication.applicantName,
        applicantEmail: selectedApplication.applicantEmail,
        applicantPhone: selectedApplication.applicantPhone,
        serviceType: selectedApplication.serviceType
      };
      
      await DeregService.updateAppliedService(selectedApplication.id, updateData);
      setUpdateDialogOpen(false);
      setSuccess('Deregistration application updated successfully!');
      fetchApplications(); // Refresh the list
    } catch (err) {
      console.error('Error updating application:', err);
      setError('Failed to update application. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
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

  const getOutstandingStatus = (hasObligations: boolean): string => {
    return hasObligations ? 'Yes' : 'No';
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
        <Typography variant="h6" sx={{ ml: 2 }}>Loading deregistration applications...</Typography>
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
            Company Deregistration Applications
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
          label="Search Deregistration Applications"
          placeholder="Search by company name, registration number, business type, applicant name or email..."
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
                ? 'No deregistration applications found.' 
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
                            #{application.registrationNumber || 'No registration number'}
                          </Typography>
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
                            Applicant:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {application.applicantName || 'N/A'}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" fontWeight="medium">
                            Business Type:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {application.businessType || 'N/A'}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" fontWeight="medium">
                            Applied Date:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(application.createdAt)}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" fontWeight="medium">
                            Outstanding Obligations:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {getOutstandingStatus(application.hasOutstandingObligations)}
                          </Typography>
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" fontWeight="medium">
                          Reason for Deregistration:
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {application.deregistrationReason || 'Not specified'}
                        </Typography>
                      </Box>
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
                          onClick={() => handleUpdateClick(application)}
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
                Applicant: {selectedApplication.applicantName}
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

      {/* Update Application Dialog */}
      <Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EditIcon sx={{ mr: 1 }} />
            Update Deregistration Application
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
                    value={updateForm.companyName}
                    onChange={(e) => setUpdateForm({...updateForm, companyName: e.target.value})}
                    margin="normal"
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Business Type</InputLabel>
                    <Select
                      value={updateForm.businessType}
                      label="Business Type"
                      onChange={(e) => setUpdateForm({...updateForm, businessType: e.target.value})}
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
                  <TextField
                    fullWidth
                    label="Registration Number"
                    value={updateForm.registrationNumber}
                    onChange={(e) => setUpdateForm({...updateForm, registrationNumber: e.target.value})}
                    margin="normal"
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Registration Date"
                    type="date"
                    value={updateForm.registrationDate}
                    onChange={(e) => setUpdateForm({...updateForm, registrationDate: e.target.value})}
                    margin="normal"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Position in Company</InputLabel>
                    <Select
                      value={updateForm.positionInCompany}
                      label="Position in Company"
                      onChange={(e) => setUpdateForm({...updateForm, positionInCompany: e.target.value})}
                    >
                      {positionsInCompany.map(position => (
                        <MenuItem key={position} value={position}>
                          {position}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Authority to Act"
                    value={updateForm.authorityToAct}
                    onChange={(e) => setUpdateForm({...updateForm, authorityToAct: e.target.value})}
                    margin="normal"
                    placeholder="e.g., Board Resolution, Power of Attorney"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Reason for Deregistration</InputLabel>
                    <Select
                      value={updateForm.deregistrationReason}
                      label="Reason for Deregistration"
                      onChange={(e) => setUpdateForm({...updateForm, deregistrationReason: e.target.value})}
                    >
                      {deregistrationReasons.map(reason => (
                        <MenuItem key={reason} value={reason}>
                          {reason}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={updateForm.hasOutstandingObligations}
                        onChange={(e) => setUpdateForm({...updateForm, hasOutstandingObligations: e.target.checked})}
                      />
                    }
                    label="Has Outstanding Obligations (taxes, debts, etc.)"
                  />
                </Grid>
                
                {updateForm.hasOutstandingObligations && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Outstanding Obligations Details"
                      value={updateForm.outstandingDetails}
                      onChange={(e) => setUpdateForm({...updateForm, outstandingDetails: e.target.value})}
                      margin="normal"
                      multiline
                      rows={3}
                      placeholder="Please provide details of outstanding obligations..."
                    />
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialogOpen(false)} disabled={updateLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateConfirm} 
            variant="contained"
            disabled={updateLoading}
            startIcon={updateLoading ? <CircularProgress size={20} /> : null}
          >
            {updateLoading ? 'Updating...' : 'Update Application'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Application Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <VisibilityIcon sx={{ mr: 1 }} />
            Application Details
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
                    <Typography variant="body2" fontWeight="medium">Applicant Name:</Typography>
                    <Typography variant="body1">{selectedApplication.applicantName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" fontWeight="medium">Applicant Email:</Typography>
                    <Typography variant="body1">{selectedApplication.applicantEmail}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" fontWeight="medium">Applicant Phone:</Typography>
                    <Typography variant="body1">{selectedApplication.applicantPhone}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" fontWeight="medium">Business Type:</Typography>
                    <Typography variant="body1">{selectedApplication.businessType}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" fontWeight="medium">Registration Number:</Typography>
                    <Typography variant="body1">{selectedApplication.registrationNumber || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" fontWeight="medium">Registration Date:</Typography>
                    <Typography variant="body1">{selectedApplication.registrationDate || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" fontWeight="medium">Position in Company:</Typography>
                    <Typography variant="body1">{selectedApplication.positionInCompany}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" fontWeight="medium">Authority to Act:</Typography>
                    <Typography variant="body1">{selectedApplication.authorityToAct || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Deregistration Details */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Deregistration Details
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          <Typography variant="body2" fontWeight="medium">Reason for Deregistration:</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{selectedApplication.deregistrationReason}</Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          <Typography variant="body2" fontWeight="medium">Outstanding Obligations:</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {getOutstandingStatus(selectedApplication.hasOutstandingObligations)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      {selectedApplication.hasOutstandingObligations && selectedApplication.outstandingDetails && (
                        <TableRow>
                          <TableCell component="th" scope="row">
                            <Typography variant="body2" fontWeight="medium">Obligations Details:</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{selectedApplication.outstandingDetails}</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell component="th" scope="row">
                          <Typography variant="body2" fontWeight="medium">Applied On:</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatDate(selectedApplication.createdAt)}</Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          <Typography variant="body2" fontWeight="medium">Last Updated:</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatDate(selectedApplication.updatedAt)}</Typography>
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
                Are you sure you want to delete the deregistration application for <strong>{selectedApplication.companyName}</strong>?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Application ID: {selectedApplication.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Registration #: {selectedApplication.registrationNumber || 'N/A'}
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
    </Box>
  );
};

export default CompanyDeregistration;
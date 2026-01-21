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
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
  Update as UpdateIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import CollegeRegService from '../../services/college_service';

// Types
interface CollegeApplication {
  id: string;
  applicantName: string;
  churchName: string;
  email: string;
  phoneNumber: string;
  whatsappNumber: string;
  serviceType: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  applicationDate: Date;
  createdAt: Date;
  updatedAt: Date;
  registrationNumber?: string;
  collegeName?: string;
  collegeAddress?: string;
  accreditationStatus?: string;
}

const statusOptions = [
  { value: 'Approved', label: 'Approved', color: 'success' },
  { value: 'Pending', label: 'Pending', color: 'warning' },
  { value: 'Rejected', label: 'Rejected', color: 'error' },
];

const accreditationOptions = [
  { value: 'Not Applied', label: 'Not Applied' },
  { value: 'Applied', label: 'Applied' },
  { value: 'Under Review', label: 'Under Review' },
  { value: 'Accredited', label: 'Accredited' },
  { value: 'Not Accredited', label: 'Not Accredited' }
];

// Map API data to CollegeApplication interface
const mapApiDataToApplication = (apiData: any): CollegeApplication => {
  return {
    id: apiData.id || apiData._id || Math.random().toString(36).substr(2, 9),
    applicantName: apiData.applicantName || 'Unknown Applicant',
    churchName: apiData.churchName || '',
    email: apiData.email || '',
    phoneNumber: apiData.phoneNumber || '',
    whatsappNumber: apiData.whatsappNumber || '',
    serviceType: apiData.serviceType || 'College Registration',
    status: (apiData.status?.toLowerCase() as CollegeApplication['status']) || 'pending',
    applicationDate: apiData.applicationDate ? new Date(apiData.applicationDate) : new Date(),
    createdAt: apiData.createdAt ? new Date(apiData.createdAt) : new Date(),
    updatedAt: apiData.updatedAt ? new Date(apiData.updatedAt) : new Date(),
    registrationNumber: apiData.registrationNumber || `COLLEGE-${Math.floor(100000 + Math.random() * 900000)}`,
    collegeName: apiData.collegeName || '',
    collegeAddress: apiData.collegeAddress || '',
    accreditationStatus: apiData.accreditationStatus || 'Not Applied'
  };
};

const CollegeRegistration: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [applications, setApplications] = useState<CollegeApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<CollegeApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<CollegeApplication | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Update form state
  const [updateForm, setUpdateForm] = useState({
    applicantName: '',
    churchName: '',
    email: '',
    phoneNumber: '',
    whatsappNumber: '',
    collegeName: '',
    collegeAddress: '',
    registrationNumber: '',
    accreditationStatus: ''
  });

  // Fetch data from API
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await CollegeRegService.getAllCollegeRegistrations();
      
      // Map API response to Application objects
      const mappedApplications = response.map((item: any) => mapApiDataToApplication(item));
      
      setApplications(mappedApplications);
      setFilteredApplications(mappedApplications);
      setError(null);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load college applications. Please try again later.');
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
        app.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.churchName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.collegeName && app.collegeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.registrationNumber && app.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredApplications(filtered);
    }
  }, [searchTerm, applications]);

  const handleStatusUpdateClick = (application: CollegeApplication) => {
    setSelectedApplication(application);
    setSelectedStatus(application.status);
    setStatusDialogOpen(true);
  };

  const handleDeleteClick = (application: CollegeApplication) => {
    setSelectedApplication(application);
    setDeleteDialogOpen(true);
  };

  const handleUpdateClick = (application: CollegeApplication) => {
    setSelectedApplication(application);
    setUpdateForm({
      applicantName: application.applicantName || '',
      churchName: application.churchName || '',
      email: application.email || '',
      phoneNumber: application.phoneNumber || '',
      whatsappNumber: application.whatsappNumber || '',
      collegeName: application.collegeName || '',
      collegeAddress: application.collegeAddress || '',
      registrationNumber: application.registrationNumber || '',
      accreditationStatus: application.accreditationStatus || 'Not Applied'
    });
    setUpdateDialogOpen(true);
  };

  const handleViewClick = (application: CollegeApplication) => {
    setSelectedApplication(application);
    setViewDialogOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedApplication || !selectedStatus) return;
    
    try {
      setUpdateLoading(true);
      // Assuming the API expects the status in the update endpoint
      await CollegeRegService.updateCollegeRegistration(selectedApplication.id, { status: selectedStatus });
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
      await CollegeRegService.deleteCollegeRegistration(selectedApplication.id);
      setDeleteDialogOpen(false);
      setSuccess('College application deleted successfully!');
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
        serviceType: selectedApplication.serviceType,
        applicationDate: selectedApplication.applicationDate
      };
      
      await CollegeRegService.updateCollegeRegistration(selectedApplication.id, updateData);
      setUpdateDialogOpen(false);
      setSuccess('College application updated successfully!');
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

  const getAccreditationColor = (status: string): string => {
    switch (status) {
      case 'Accredited':
        return theme.palette.success.main;
      case 'Under Review':
        return theme.palette.info.main;
      case 'Applied':
        return theme.palette.warning.main;
      case 'Not Accredited':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
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
        <Typography variant="h6" sx={{ ml: 2 }}>Loading college applications...</Typography>
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
            <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            College Registration Applications
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
          label="Search College Applications"
          placeholder="Search by applicant name, church name, college name, registration number, email or phone..."
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
                ? 'No college registration applications found.' 
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
                            {application.collegeName || 'College Registration'}
                          </Typography>
                          {application.registrationNumber && (
                            <Typography variant="body2" color="text.secondary">
                              #{application.registrationNumber}
                            </Typography>
                          )}
                          <Typography variant="body2" color="primary">
                            {application.serviceType}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                          <Chip
                            label={application.status.toUpperCase()}
                            sx={{ 
                              backgroundColor: getStatusColor(application.status),
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                            size="small"
                          />
                          {application.accreditationStatus && application.accreditationStatus !== 'Not Applied' && (
                            <Chip
                              label={application.accreditationStatus}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                borderColor: getAccreditationColor(application.accreditationStatus),
                                color: getAccreditationColor(application.accreditationStatus)
                              }}
                            />
                          )}
                        </Box>
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
                            Church:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {application.churchName || 'N/A'}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" fontWeight="medium">
                            Email:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {application.email || 'N/A'}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" fontWeight="medium">
                            Applied Date:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(application.applicationDate)}
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
                Update status for <strong>{selectedApplication.collegeName || 'College Registration'}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Application ID: {selectedApplication.id}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Applicant: {selectedApplication.applicantName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Church: {selectedApplication.churchName}
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
            Update College Application
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
                    label="Applicant Name"
                    value={updateForm.applicantName}
                    onChange={(e) => setUpdateForm({...updateForm, applicantName: e.target.value})}
                    margin="normal"
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Church Name"
                    value={updateForm.churchName}
                    onChange={(e) => setUpdateForm({...updateForm, churchName: e.target.value})}
                    margin="normal"
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={updateForm.email}
                    onChange={(e) => setUpdateForm({...updateForm, email: e.target.value})}
                    margin="normal"
                    type="email"
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={updateForm.phoneNumber}
                    onChange={(e) => setUpdateForm({...updateForm, phoneNumber: e.target.value})}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="WhatsApp Number"
                    value={updateForm.whatsappNumber}
                    onChange={(e) => setUpdateForm({...updateForm, whatsappNumber: e.target.value})}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="College Name"
                    value={updateForm.collegeName}
                    onChange={(e) => setUpdateForm({...updateForm, collegeName: e.target.value})}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="College Address"
                    value={updateForm.collegeAddress}
                    onChange={(e) => setUpdateForm({...updateForm, collegeAddress: e.target.value})}
                    margin="normal"
                    multiline
                    rows={2}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Registration Number"
                    value={updateForm.registrationNumber}
                    onChange={(e) => setUpdateForm({...updateForm, registrationNumber: e.target.value})}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Accreditation Status</InputLabel>
                    <Select
                      value={updateForm.accreditationStatus}
                      label="Accreditation Status"
                      onChange={(e) => setUpdateForm({...updateForm, accreditationStatus: e.target.value})}
                    >
                      {accreditationOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
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
            College Application Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ mb: 3, p: 2, backgroundColor: theme.palette.background.default, borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" fontWeight="medium">College Name:</Typography>
                    <Typography variant="body1">{selectedApplication.collegeName || 'Not specified'}</Typography>
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
                    <Typography variant="body2" fontWeight="medium">Church Name:</Typography>
                    <Typography variant="body1">{selectedApplication.churchName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" fontWeight="medium">Email:</Typography>
                    <Typography variant="body1">{selectedApplication.email}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" fontWeight="medium">Phone:</Typography>
                    <Typography variant="body1">{selectedApplication.phoneNumber || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" fontWeight="medium">WhatsApp:</Typography>
                    <Typography variant="body1">{selectedApplication.whatsappNumber || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" fontWeight="medium">Registration Number:</Typography>
                    <Typography variant="body1">{selectedApplication.registrationNumber || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" fontWeight="medium">Accreditation Status:</Typography>
                    <Chip 
                      label={selectedApplication.accreditationStatus || 'Not Applied'} 
                      variant="outlined"
                      sx={{ 
                        borderColor: getAccreditationColor(selectedApplication.accreditationStatus || 'Not Applied'),
                        color: getAccreditationColor(selectedApplication.accreditationStatus || 'Not Applied')
                      }} 
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* College Details Table */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Application Timeline
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          <Typography variant="body2" fontWeight="medium">Service Type:</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{selectedApplication.serviceType}</Typography>
                        </TableCell>
                      </TableRow>
                      {selectedApplication.collegeAddress && (
                        <TableRow>
                          <TableCell component="th" scope="row">
                            <Typography variant="body2" fontWeight="medium">College Address:</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{selectedApplication.collegeAddress}</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell component="th" scope="row">
                          <Typography variant="body2" fontWeight="medium">Application Date:</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatDate(selectedApplication.applicationDate)}</Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          <Typography variant="body2" fontWeight="medium">Created On:</Typography>
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
                Are you sure you want to delete the college registration application for <strong>{selectedApplication.applicantName}</strong>?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Application ID: {selectedApplication.id}
              </Typography>
              {selectedApplication.collegeName && (
                <Typography variant="body2" color="text.secondary">
                  College: {selectedApplication.collegeName}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Church: {selectedApplication.churchName}
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

export default CollegeRegistration;
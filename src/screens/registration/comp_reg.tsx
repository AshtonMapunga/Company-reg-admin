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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
  Update as UpdateIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import companyService from '../../services/comp_servi';

// Types
interface Director {
  fullName: string;
  idNumber: string;
  nationality: string;
  occupation: string;
  phoneNumber: string;
}

interface CompanyApplication {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  serviceType: string;
  status: 'Approved' | 'Pending' | 'Rejected' ;
  companyName: string;
  companyName2: string;
  companyName3: string;
  directors: Director[];
  directorsCount: number;
  contactEmail: string;
  businessType: string;
  companyAddress: string;
  positionInCompany: string;
  registrationNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const statusOptions = [
  { value: 'Approved', label: 'Approved', color: 'success' },
  { value: 'Pending', label: 'Pending', color: 'warning' },
  { value: 'Rejected', label: 'Rejected', color: 'error' },
];

const businessTypeOptions = [
  { value: 'Private Limited', label: 'Private Limited Company' },
  { value: 'Public Limited', label: 'Public Limited Company' },
  { value: 'Sole Proprietorship', label: 'Sole Proprietorship' },
  { value: 'Partnership', label: 'Partnership' },
  { value: 'Non-Profit', label: 'Non-Profit Organization' }
];

// Map API data to CompanyApplication interface
const mapApiDataToApplication = (apiData: any): CompanyApplication => {
  return {
    id: apiData.id || apiData._id || Math.random().toString(36).substr(2, 9),
    applicantName: apiData.applicantName || 'Unknown Applicant',
    applicantEmail: apiData.applicantEmail || '',
    applicantPhone: apiData.applicantPhone || '',
    serviceType: apiData.serviceType || 'Company Registration',
    status: (apiData.status?.toLowerCase() as CompanyApplication['status']) || 'Pending',
    companyName: apiData.companyName || '',
    companyName2: apiData.companyName2 || '',
    companyName3: apiData.companyName3 || '',
    directors: apiData.directors || [],
    directorsCount: apiData.directorsCount || 0,
    contactEmail: apiData.contactEmail || '',
    businessType: apiData.businessType || 'Private Limited',
    companyAddress: apiData.companyAddress || '',
    positionInCompany: apiData.positionInCompany || '',
    registrationNumber: apiData.registrationNumber || `COMP-${Math.floor(100000 + Math.random() * 900000)}`,
    createdAt: apiData.createdAt ? new Date(apiData.createdAt) : new Date(),
    updatedAt: apiData.updatedAt ? new Date(apiData.updatedAt) : new Date()
  };
};

const CompanyRegistration2: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [applications, setApplications] = useState<CompanyApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<CompanyApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<CompanyApplication | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Update form state
  const [updateForm, setUpdateForm] = useState({
    companyName: '',
    companyName2: '',
    companyName3: '',
    contactEmail: '',
    businessType: '',
    companyAddress: '',
    positionInCompany: '',
    registrationNumber: ''
  });

  // Fetch data from API
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await companyService.getAllCompanyApplications();
      
      // Map API response to Application objects
      const mappedApplications = response.map((item: any) => mapApiDataToApplication(item));
      
      setApplications(mappedApplications);
      setFilteredApplications(mappedApplications);
      setError(null);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load company applications. Please try again later.');
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
        app.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.registrationNumber && app.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        app.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicantEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredApplications(filtered);
    }
  }, [searchTerm, applications]);

  const handleStatusUpdateClick = (application: CompanyApplication) => {
    setSelectedApplication(application);
    setSelectedStatus(application.status);
    setStatusDialogOpen(true);
  };

  const handleDeleteClick = (application: CompanyApplication) => {
    setSelectedApplication(application);
    setDeleteDialogOpen(true);
  };

  const handleUpdateClick = (application: CompanyApplication) => {
    setSelectedApplication(application);
    setUpdateForm({
      companyName: application.companyName || '',
      companyName2: application.companyName2 || '',
      companyName3: application.companyName3 || '',
      contactEmail: application.contactEmail || '',
      businessType: application.businessType || '',
      companyAddress: application.companyAddress || '',
      positionInCompany: application.positionInCompany || '',
      registrationNumber: application.registrationNumber || ''
    });
    setUpdateDialogOpen(true);
  };

  const handleViewClick = (application: CompanyApplication) => {
    setSelectedApplication(application);
    setViewDialogOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedApplication || !selectedStatus) return;
    
    try {
      setUpdateLoading(true);
      await companyService.updateStatusService(selectedApplication.id, { status: selectedStatus });
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
      await companyService.deleteCompanyApplication(selectedApplication.id);
      setDeleteDialogOpen(false);
      setSuccess('Company application deleted successfully!');
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
      
      await companyService.updateCompanyApplication(selectedApplication.id, updateData);
      setUpdateDialogOpen(false);
      setSuccess('Company application updated successfully!');
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

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <Typography variant="h6" sx={{ ml: 2 }}>Loading company applications...</Typography>
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
            Company Registration Applications
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
          label="Search Company Applications"
          placeholder="Search by company name, applicant name, registration number, or email..."
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
                ? 'No company registration applications found.' 
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
                          {application.registrationNumber && (
                            <Typography variant="body2" color="text.secondary">
                              #{application.registrationNumber}
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
                            Contact Email:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {application.applicantEmail || 'N/A'}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" fontWeight="medium">
                            Phone Number:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {application.applicantPhone || 'N/A'}
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
                            Last Updated:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(application.updatedAt)}
                          </Typography>
                        </Grid>
                      </Grid>

                      {/* Directors Count */}
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" fontWeight="medium">
                          Directors: {application.directorsCount || 0}
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
            Update Company Application
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
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Alternative Name 1"
                    value={updateForm.companyName2}
                    onChange={(e) => setUpdateForm({...updateForm, companyName2: e.target.value})}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Alternative Name 2"
                    value={updateForm.companyName3}
                    onChange={(e) => setUpdateForm({...updateForm, companyName3: e.target.value})}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Email"
                    value={updateForm.contactEmail}
                    onChange={(e) => setUpdateForm({...updateForm, contactEmail: e.target.value})}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Business Type</InputLabel>
                    <Select
                      value={updateForm.businessType}
                      label="Business Type"
                      onChange={(e) => setUpdateForm({...updateForm, businessType: e.target.value})}
                    >
                      {businessTypeOptions.map(option => (
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
                    label="Registration Number"
                    value={updateForm.registrationNumber}
                    onChange={(e) => setUpdateForm({...updateForm, registrationNumber: e.target.value})}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company Address"
                    value={updateForm.companyAddress}
                    onChange={(e) => setUpdateForm({...updateForm, companyAddress: e.target.value})}
                    margin="normal"
                    multiline
                    rows={2}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Position in Company"
                    value={updateForm.positionInCompany}
                    onChange={(e) => setUpdateForm({...updateForm, positionInCompany: e.target.value})}
                    margin="normal"
                  />
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
                  <Grid item xs={12}>
                    <Typography variant="body2" fontWeight="medium">Company Address:</Typography>
                    <Typography variant="body1">{selectedApplication.companyAddress}</Typography>
                  </Grid>
                  {selectedApplication.companyName2 && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" fontWeight="medium">Alternative Name 1:</Typography>
                      <Typography variant="body1">{selectedApplication.companyName2}</Typography>
                    </Grid>
                  )}
                  {selectedApplication.companyName3 && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" fontWeight="medium">Alternative Name 2:</Typography>
                      <Typography variant="body1">{selectedApplication.companyName3}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>

              {/* Directors Table */}
              {selectedApplication.directors && selectedApplication.directors.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Directors ({selectedApplication.directorsCount})
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Full Name</strong></TableCell>
                          <TableCell><strong>ID Number</strong></TableCell>
                          <TableCell><strong>Nationality</strong></TableCell>
                          <TableCell><strong>Occupation</strong></TableCell>
                          <TableCell><strong>Phone Number</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedApplication.directors.map((director, index) => (
                          <TableRow key={index}>
                            <TableCell>{director.fullName}</TableCell>
                            <TableCell>{director.idNumber}</TableCell>
                            <TableCell>{director.nationality}</TableCell>
                            <TableCell>{director.occupation}</TableCell>
                            <TableCell>{director.phoneNumber}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
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
                Are you sure you want to delete the company registration application for <strong>{selectedApplication.companyName}</strong>?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Application ID: {selectedApplication.id}
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

export default CompanyRegistration2;
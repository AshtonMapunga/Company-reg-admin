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
  Select
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Update as UpdateIcon,
  Person as PersonIcon
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
  status: 'approved' | 'pending' | 'rejected' | 'in-review';
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
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' }
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
    status: apiData.status || 'pending',
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
  const [selectedApplication, setSelectedApplication] = useState<CompanyApplication | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

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
        app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.registrationNumber && app.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        app.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleStatusUpdate = async () => {
    if (!selectedApplication || !selectedStatus) return;
    
    try {
      await companyService.updateStatusService(selectedApplication.id, { status: selectedStatus });
      setStatusDialogOpen(false);
      setSuccess('Status updated successfully!');
      fetchApplications(); // Refresh the list
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status. Please try again.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedApplication) return;
    
    try {
      await companyService.deleteCompanyApplication(selectedApplication.id);
      setDeleteDialogOpen(false);
      setSuccess('Company application deleted successfully!');
      fetchApplications(); // Refresh the list
    } catch (err) {
      console.error('Error deleting application:', err);
      setError('Failed to delete application. Please try again.');
    }
  };

  const getStatusColor = (status: string): string => {
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

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
        <Typography variant="h6">Loading company applications...</Typography>
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
          >
            Refresh
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
                    gap: 2
                  }}>
                    {/* Application Info */}
                    <Box sx={{ flex: 1 }}>
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
                            {application.contactEmail || 'N/A'}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" fontWeight="medium">
                            Directors:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {application.directorsCount || 0}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" fontWeight="medium">
                            Applicant Email:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {application.applicantEmail || 'N/A'}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" fontWeight="medium">
                            Applicant Phone:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {application.applicantPhone || 'N/A'}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" fontWeight="medium">
                            Position:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {application.positionInCompany || 'N/A'}
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
                        
                        <Grid item xs={12}>
                          <Typography variant="body2" fontWeight="medium">
                            Company Address:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {application.companyAddress || 'N/A'}
                          </Typography>
                        </Grid>
                        
                        {application.companyName2 && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" fontWeight="medium">
                              Alternative Name 1:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {application.companyName2}
                            </Typography>
                          </Grid>
                        )}
                        
                        {application.companyName3 && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" fontWeight="medium">
                              Alternative Name 2:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {application.companyName3}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>

                      {/* Directors Table */}
                      {application.directors && application.directors.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" fontWeight="medium" gutterBottom>
                            Directors:
                          </Typography>
                          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200 }}>
                            <Table size="small" stickyHeader>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Name</TableCell>
                                  <TableCell>ID Number</TableCell>
                                  <TableCell>Nationality</TableCell>
                                  <TableCell>Occupation</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {application.directors.map((director, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{director.fullName}</TableCell>
                                    <TableCell>{director.idNumber}</TableCell>
                                    <TableCell>{director.nationality}</TableCell>
                                    <TableCell>{director.occupation}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      )}
                    </Box>

                    {/* Actions */}
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      flexWrap: 'wrap',
                      alignSelf: isMobile ? 'flex-end' : 'center'
                    }}>
                      <Button
                        variant="outlined"
                        startIcon={<UpdateIcon />}
                        onClick={() => handleStatusUpdateClick(application)}
                        size="small"
                      >
                        Update Status
                      </Button>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(application)}
                        aria-label="Delete"
                      >
                        <DeleteIcon />
                      </IconButton>
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
          {selectedApplication && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                Update status for <strong>{selectedApplication.companyName}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Registration #: {selectedApplication.registrationNumber || 'N/A'}
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
            Are you sure you want to delete the company registration application for {selectedApplication?.companyName}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyRegistration2;
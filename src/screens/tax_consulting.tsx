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
  Grid,
  InputAdornment
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
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import appiledService from '../services/applied_service_service';

// Types
interface TaxConsultancy {
  id: string;
  _id?: string;
  companyName: string;
  email: string;
  contactName: string;
  phoneNumber: string;
  status: 'Approved' | 'Pending'| 'Rejected';
  appliedDate: Date;
  updatedDate: Date;
  referenceNumber: string;
  businessType?: string;
  address?: string;
  serviceType?: string;
  annualTurnover?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const statusOptions = [
  { value: 'Approved', label: 'Approved', color: 'success' },
  { value: 'Pending', label: 'Pending', color: 'warning' },
  { value: 'Rejected', label: 'Rejected', color: 'error' }
];

const businessTypes = [
  'Manufacturing',
  'Retail',
  'Services',
  'Construction',
  'Technology',
  'Agriculture',
  'Healthcare',
  'Education',
  'Hospitality',
  'Transportation',
  'Consulting',
  'Other'
];

const serviceTypes = [
  'Tax Planning',
  'Tax Compliance',
  'Tax Advisory',
  'VAT Registration',
  'Tax Audits',
  'Corporate Tax',
  'Personal Tax',
  'International Tax',
  'Tax Appeals',
  'Other'
];

const mapApiDataToTaxConsultancy = (apiData: any): TaxConsultancy => {
  const id = apiData.id || apiData._id || Math.random().toString(36).substr(2, 9);
  
  // Map status - handle different possible formats
  let status: TaxConsultancy['status'] = 'Pending';
  if (apiData.status) {
    const statusStr = apiData.status.toLowerCase();
    if (statusStr.includes('Approved')) status = 'Approved';
    else if (statusStr.includes('Rejected')) status = 'Rejected';
    else if (statusStr.includes('Pending')) status = 'Pending';
  }
  
  const appliedDate = apiData.appliedDate ? new Date(apiData.appliedDate) : 
                     apiData.createdAt ? new Date(apiData.createdAt) : new Date();
  
  const updatedDate = apiData.updatedDate ? new Date(apiData.updatedDate) : 
                     apiData.updatedAt ? new Date(apiData.updatedAt) : new Date();
  
  return {
    id,
    _id: apiData._id,
    companyName: apiData.companyName || apiData.businessName || 'Unknown Company',
    email: apiData.email || apiData.contactEmail || '',
    contactName: apiData.contactName || apiData.contactPerson || '',
    phoneNumber: apiData.phoneNumber || apiData.contactPhone || '',
    status,
    appliedDate,
    updatedDate,
    referenceNumber: apiData.referenceNumber || `TAX-${Math.floor(100000 + Math.random() * 900000)}`,
    businessType: apiData.businessType || apiData.industry || '',
    address: apiData.address || apiData.businessAddress || '',
    serviceType: apiData.serviceType || apiData.serviceRequired || '',
    annualTurnover: apiData.annualTurnover || apiData.revenue || '',
    createdAt: apiData.createdAt ? new Date(apiData.createdAt) : undefined,
    updatedAt: apiData.updatedAt ? new Date(apiData.updatedAt) : undefined
  };
};

const TaxConsultancyManagement: React.FC = () => {
  const [consultancies, setConsultancies] = useState<TaxConsultancy[]>([]);
  const [filteredConsultancies, setFilteredConsultancies] = useState<TaxConsultancy[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedConsultancy, setSelectedConsultancy] = useState<TaxConsultancy | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Edit form state
  const [editFormData, setEditFormData] = useState<Partial<TaxConsultancy>>({});

  // Fetch data from API
  const fetchConsultancies = async () => {
    try {
      setLoading(true);
      const response = await appiledService.getAllAppliedService();
      
      // Map API response to TaxConsultancy objects
      const mappedConsultancies = Array.isArray(response) 
        ? response.map((item: any) => mapApiDataToTaxConsultancy(item))
        : [];
      
      setConsultancies(mappedConsultancies);
      setFilteredConsultancies(mappedConsultancies);
      setError(null);
    } catch (err) {
      console.error('Error fetching tax consultancies:', err);
      setError('Failed to load tax consultancies. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultancies();
  }, []);

  // Filter consultancies based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredConsultancies(consultancies);
    } else {
      const filtered = consultancies.filter(consultancy =>
        consultancy.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultancy.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultancy.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultancy.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultancy.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultancy.businessType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredConsultancies(filtered);
    }
  }, [searchTerm, consultancies]);

  const handleStatusUpdateClick = (consultancy: TaxConsultancy) => {
    setSelectedConsultancy(consultancy);
    setSelectedStatus(consultancy.status);
    setStatusDialogOpen(true);
  };

  const handleDeleteClick = (consultancy: TaxConsultancy) => {
    setSelectedConsultancy(consultancy);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (consultancy: TaxConsultancy) => {
    setSelectedConsultancy(consultancy);
    setEditFormData({
      companyName: consultancy.companyName || '',
      email: consultancy.email || '',
      contactName: consultancy.contactName || '',
      phoneNumber: consultancy.phoneNumber || '',
      businessType: consultancy.businessType || '',
      address: consultancy.address || '',
      serviceType: consultancy.serviceType || '',
      annualTurnover: consultancy.annualTurnover || '',
      status: consultancy.status || 'Pending',
      referenceNumber: consultancy.referenceNumber || ''
    });
    setEditDialogOpen(true);
  };

  const handleViewClick = (consultancy: TaxConsultancy) => {
    setSelectedConsultancy(consultancy);
    setViewDialogOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedConsultancy || !selectedStatus) return;
    
    try {
      setUpdateLoading(true);
      await appiledService.updateAppliedService(selectedConsultancy.id, { 
        ...selectedConsultancy,
        status: selectedStatus 
      });
      setStatusDialogOpen(false);
      setSuccess('Status updated successfully!');
      fetchConsultancies(); // Refresh the list
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedConsultancy) return;
    
    try {
      setUpdateLoading(true);
      await appiledService.updateAppliedService(selectedConsultancy.id, editFormData);
      setEditDialogOpen(false);
      setSuccess('Tax consultancy updated successfully!');
      fetchConsultancies(); // Refresh the list
    } catch (err) {
      console.error('Error updating consultancy:', err);
      setError('Failed to update consultancy. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedConsultancy) return;
    
    try {
      setDeleteLoading(true);
      await appiledService.deleteAppliedService(selectedConsultancy.id);
      setDeleteDialogOpen(false);
      setSuccess('Tax consultancy deleted successfully!');
      fetchConsultancies(); // Refresh the list
    } catch (err) {
      console.error('Error deleting consultancy:', err);
      setError('Failed to delete consultancy. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleInputChange = (field: keyof TaxConsultancy, value: string) => {
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading tax consultancies...</Typography>
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
            <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Tax Consultancy Applications
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={fetchConsultancies}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>

        <Typography variant="body1" color="text.secondary" gutterBottom>
          Manage tax consultancy applications and their status
        </Typography>

        {/* Search Bar */}
        <Paper elevation={1} sx={{ p: 2, mb: 3, mt: 3 }}>
          <TextField
            fullWidth
            label="Search Consultancies"
            placeholder="Search by company name, contact person, email, phone, reference, or business type..."
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
            Showing {filteredConsultancies.length} of {consultancies.length} applications
          </Typography>
        </Box>
      </Box>

      {/* Consultancies Table */}
      <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden', mb: 4 }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label="tax consultancy applications table">
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
                  Service Type
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
              {filteredConsultancies.map((consultancy) => (
                <TableRow 
                  key={consultancy.id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight="medium">
                        {consultancy.companyName}
                      </Typography>
                    </Box>
                    {consultancy.referenceNumber && (
                      <Typography variant="body2" color="text.secondary" fontSize="small">
                        #{consultancy.referenceNumber}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {consultancy.contactName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2">{consultancy.email}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {consultancy.phoneNumber || 'N/A'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {consultancy.businessType || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {consultancy.serviceType || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={consultancy.status.toUpperCase()}
                      sx={{ 
                        backgroundColor: getStatusColor(consultancy.status),
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
                          onClick={() => handleViewClick(consultancy)}
                          aria-label="View"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Update Status">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleStatusUpdateClick(consultancy)}
                          aria-label="Update Status"
                        >
                          <UpdateIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Edit Application">
                        <IconButton
                          color="warning"
                          size="small"
                          onClick={() => handleEditClick(consultancy)}
                          aria-label="Edit"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Delete Application">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDeleteClick(consultancy)}
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

        {filteredConsultancies.length === 0 && (
          <Box textAlign="center" py={8}>
            <Typography variant="body1" color="text.secondary">
              {consultancies.length === 0 
                ? 'No tax consultancy applications found.' 
                : 'No applications match your search criteria.'}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {selectedConsultancy && getStatusIcon(selectedStatus)}
            Update Application Status
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedConsultancy && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                Update status for <strong>{selectedConsultancy.companyName}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Application ID: {selectedConsultancy.id}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Reference #: {selectedConsultancy.referenceNumber || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Contact: {selectedConsultancy.contactName}
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
            disabled={!selectedStatus || updateLoading || selectedStatus === selectedConsultancy?.status}
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
            Edit Tax Consultancy Application
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedConsultancy && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Application ID: {selectedConsultancy.id}
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
                    label="Reference Number"
                    value={editFormData.referenceNumber || ''}
                    onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Person"
                    value={editFormData.contactName || ''}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
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
                    <InputLabel>Service Type</InputLabel>
                    <Select
                      value={editFormData.serviceType || ''}
                      label="Service Type"
                      onChange={(e) => handleInputChange('serviceType', e.target.value)}
                    >
                      {serviceTypes.map(type => (
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
                    label="Annual Turnover"
                    value={editFormData.annualTurnover || ''}
                    onChange={(e) => handleInputChange('annualTurnover', e.target.value)}
                    margin="normal"
                    placeholder="e.g., $500,000"
                  />
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
            Tax Consultancy Application Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedConsultancy && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{ p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight="medium" color="text.secondary" gutterBottom>
                      Company Information
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="medium">Company Name:</Typography>
                      <Typography variant="body1">{selectedConsultancy.companyName}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="medium">Reference Number:</Typography>
                      <Typography variant="body1">{selectedConsultancy.referenceNumber || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="medium">Business Type:</Typography>
                      <Typography variant="body1">{selectedConsultancy.businessType || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="medium">Annual Turnover:</Typography>
                      <Typography variant="body1">{selectedConsultancy.annualTurnover || 'N/A'}</Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{ p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight="medium" color="text.secondary" gutterBottom>
                      Contact Information
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="medium">Contact Person:</Typography>
                      <Typography variant="body1">{selectedConsultancy.contactName}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="medium">Email:</Typography>
                      <Typography variant="body1">{selectedConsultancy.email}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="medium">Phone Number:</Typography>
                      <Typography variant="body1">{selectedConsultancy.phoneNumber || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="medium">Service Required:</Typography>
                      <Typography variant="body1">{selectedConsultancy.serviceType || 'N/A'}</Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper elevation={0} sx={{ p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight="medium" color="text.secondary" gutterBottom>
                      Application Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" fontWeight="medium">Status:</Typography>
                          <Chip 
                            label={selectedConsultancy.status.toUpperCase()}
                            sx={{ 
                              backgroundColor: getStatusColor(selectedConsultancy.status),
                              color: 'white'
                            }} 
                          />
                        </Box>
                      </Grid>
                      {selectedConsultancy.address && (
                        <Grid item xs={12}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" fontWeight="medium">Address:</Typography>
                            <Typography variant="body1">{selectedConsultancy.address}</Typography>
                          </Box>
                        </Grid>
                      )}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" fontWeight="medium">Applied Date:</Typography>
                          <Typography variant="body2">{formatDate(selectedConsultancy.appliedDate)}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" fontWeight="medium">Last Updated:</Typography>
                          <Typography variant="body2">{formatDate(selectedConsultancy.updatedDate)}</Typography>
                        </Box>
                      </Grid>
                      {selectedConsultancy.createdAt && (
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" fontWeight="medium">Created On:</Typography>
                            <Typography variant="body2">{formatDate(selectedConsultancy.createdAt)}</Typography>
                          </Box>
                        </Grid>
                      )}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" fontWeight="medium">Application ID:</Typography>
                          <Typography variant="body2">{selectedConsultancy.id}</Typography>
                        </Box>
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
          {selectedConsultancy && (
            <Box>
              <Alert severity="warning" sx={{ mb: 2 }}>
                This action cannot be undone.
              </Alert>
              <Typography>
                Are you sure you want to delete the tax consultancy application for <strong>{selectedConsultancy.companyName}</strong>?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Application ID: {selectedConsultancy.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Reference #: {selectedConsultancy.referenceNumber || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Contact: {selectedConsultancy.contactName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Phone: {selectedConsultancy.phoneNumber || 'N/A'}
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

export default TaxConsultancyManagement;
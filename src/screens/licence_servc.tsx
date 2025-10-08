// components/LicenceApplications.tsx
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
  Container
} from '@mui/material';
import { toast } from 'react-hot-toast';
import LicenceService from '../services/licence_service';
import StatusUpdateDialog from '../components/UpdateLicenceStatusDialog';

interface LicenceApplication {
  _id: string;
  companyName: string;
  email: string;
  address: string;
  contactPerson: string;
  phoneNumber: string;
  businessType: string;
  premisesSize: string;
  targetMarket: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
}

const LicenceApplications: React.FC = () => {
  const [applications, setApplications] = useState<LicenceApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<LicenceApplication | null>(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await LicenceService.getAllLicenceService();
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Failed to fetch applications');
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStatus = (application: LicenceApplication) => {
    setSelectedApplication(application);
    setIsDialogOpen(true);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedApplication) return;

    try {
      setUpdating(true);
      
      const statusData = {
        status: newStatus
      };

      await LicenceService.updateStatusService(selectedApplication._id, statusData);
      
      toast.success('Status updated successfully');
      
      // Update local state
      setApplications(prev => prev.map(app => 
        app._id === selectedApplication._id 
          ? { ...app, status: newStatus as any }
          : app
      ));
      
      setIsDialogOpen(false);
      setSelectedApplication(null);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Licence Applications
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage application status
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden' }}>
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
                  Business Type
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>
                  Status
                </TableCell>
                {/* <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>
                  Actions
                </TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((application) => (
                <TableRow 
                  key={application._id}
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
                    <Typography variant="body2">{application.businessType}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={application.status}
                      color={getStatusColor(application.status) as any}
                      size="small"
                    />
                  </TableCell>
                  {/* <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleEditStatus(application)}
                      disabled={updating}
                    >
                      Edit Status
                    </Button>
                  </TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {applications.length === 0 && (
          <Box textAlign="center" py={8}>
            <Typography variant="body1" color="text.secondary">
              No applications found
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Status Update Dialog */}
      <StatusUpdateDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedApplication(null);
        }}
        onStatusUpdate={handleStatusUpdate}
        currentStatus={selectedApplication?.status || 'Pending'}
        isLoading={updating}
      />
    </Container>
  );
};

export default LicenceApplications;
// components/UpdateLicenceStatusDialog.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress
} from '@mui/material';

interface StatusUpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (status: string) => void;
  currentStatus: string;
  isLoading?: boolean;
}

const StatusUpdateDialog: React.FC<StatusUpdateDialogProps> = ({
  isOpen,
  onClose,
  onStatusUpdate,
  currentStatus,
  isLoading = false,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(currentStatus);
    }
  }, [isOpen, currentStatus]);

  const statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
  ];

  const handleUpdate = () => {
    onStatusUpdate(selectedStatus);
  };

  const handleClose = () => {
    setSelectedStatus(currentStatus);
    onClose();
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Update Application Status
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              label="Status"
              disabled={isLoading}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={handleClose} 
          disabled={isLoading}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleUpdate} 
          disabled={isLoading || selectedStatus === currentStatus}
          variant="contained"
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
        >
          {isLoading ? 'Updating...' : 'Update Status'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StatusUpdateDialog;
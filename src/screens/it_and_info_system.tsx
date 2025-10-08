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
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Checkbox,
  Toolbar,
  Tooltip,
  FormControlLabel,
  Switch,
  Avatar,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import UniversalApplyService from '../services/universal_service';

// Types
interface InformationSystem {
  id: string;
  companyName: string;
  email: string;
  contactName: string;
  phoneNumber: string;
  serviceType: string;
  status: 'Pending' | 'Approved' | 'Rejected' ;
  createdAt: string;
  updatedAt?: string;
}

interface HeadCell {
  id: keyof InformationSystem;
  label: string;
  numeric: boolean;
  disablePadding: boolean;
}

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof InformationSystem) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: 'asc' | 'desc';
  orderBy: string;
  rowCount: number;
}

interface FilterOptions {
  serviceType: string;
  status: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

// Map API status to component status
const mapApiStatusToComponentStatus = (apiStatus: string): InformationSystem['status'] => {
  switch (apiStatus.toLowerCase()) {
    case 'approved':
      return 'Approved';
    case 'pending':
      return 'Pending';
  
    case 'rejected':
      return 'Rejected';
    default:
      return 'Pending';
  }
};

// Map API data to InformationSystem interface
const mapApiDataToInformationSystem = (apiData: any): InformationSystem => {
  // Generate a unique ID if not provided
  const id = apiData.id || apiData._id || Math.random().toString(36).substr(2, 9);
  
  // Use createdAt for applied date if available
  const createdAt = apiData.createdAt || new Date().toISOString();
  
  // Use updatedAt for updated date if available
  const updatedAt = apiData.updatedAt || new Date().toISOString();
  
  // Map status
  const status = mapApiStatusToComponentStatus(apiData.status || 'Pending');
  
  return {
    id,
    companyName: apiData.companyName || 'Unknown Company',
    email: apiData.email || '',
    contactName: apiData.contactName || apiData.contactPerson || '',
    phoneNumber: apiData.phoneNumber || '',
    serviceType: apiData.serviceType || 'General',
    status,
    createdAt,
    updatedAt
  };
};

const headCells: HeadCell[] = [
  { id: 'companyName', numeric: false, disablePadding: true, label: 'Company Name' },
  { id: 'contactName', numeric: false, disablePadding: false, label: 'Contact Name' },
  { id: 'email', numeric: false, disablePadding: false, label: 'Email' },
  { id: 'phoneNumber', numeric: false, disablePadding: false, label: 'Phone Number' },
  { id: 'serviceType', numeric: false, disablePadding: false, label: 'Service Type' },
  { id: 'status', numeric: false, disablePadding: false, label: 'Status' },
  { id: 'createdAt', numeric: false, disablePadding: false, label: 'Created Date' },
  // { id: 'actions', numeric: false, disablePadding: false, label: 'Actions' } as unknown as HeadCell
];

function EnhancedTableHead(props: EnhancedTableProps) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property: keyof InformationSystem) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all desserts' }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const EnhancedTableToolbar = (props: { numSelected: number; onRefresh: () => void }) => {
  const { numSelected, onRefresh } = props;

  return (
    <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
      {numSelected > 0 ? (
        <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1" component="div">
          {numSelected} selected
        </Typography>
      ) : (
        <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
          Information System Applications
        </Typography>
      )}
      <Tooltip title="Refresh">
        <IconButton onClick={onRefresh}>
          <RefreshIcon />
        </IconButton>
      </Tooltip>
    </Toolbar>
  );
};

const InformationSystemManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [informationSystems, setInformationSystems] = useState<InformationSystem[]>([]);
  const [filteredInformationSystems, setFilteredInformationSystems] = useState<InformationSystem[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    serviceType: 'all',
    status: 'all',
    dateRange: {
      start: null,
      end: null
    }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<InformationSystem | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<keyof InformationSystem>('createdAt');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [dense, setDense] = useState(false);

  // Fetch data from API
  const fetchInformationSystems = async () => {
    try {
      setLoading(true);
      const response = await UniversalApplyService.getAllUniversalApplyService();
      
      // Map API response to InformationSystem objects
      const mappedSystems = response.map((item: any) => mapApiDataToInformationSystem(item));
      
      setInformationSystems(mappedSystems);
      setFilteredInformationSystems(mappedSystems);
      setError(null);
    } catch (err) {
      console.error('Error fetching information systems:', err);
      setError('Failed to load information systems. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInformationSystems();
  }, []);

  // Get unique service types for filter dropdown
  const serviceTypes = ['all', ...new Set(informationSystems.map(system => system.serviceType))];
  const statusOptions = ['all', 'Pending', 'Approved', 'Rejected'];

  // Filter information systems based on filter options and search term
  useEffect(() => {
    let filtered = informationSystems;

    // Filter by service type
    if (filterOptions.serviceType !== 'all') {
      filtered = filtered.filter(system => 
        system.serviceType === filterOptions.serviceType
      );
    }

    // Filter by status
    if (filterOptions.status !== 'all') {
      filtered = filtered.filter(system => 
        system.status === filterOptions.status
      );
    }

    // Filter by date range
    if (filterOptions.dateRange.start) {
      filtered = filtered.filter(system => 
        new Date(system.createdAt) >= filterOptions.dateRange.start!
      );
    }
    if (filterOptions.dateRange.end) {
      filtered = filtered.filter(system => 
        new Date(system.createdAt) <= filterOptions.dateRange.end!
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(system =>
        system.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        system.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        system.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        system.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredInformationSystems(filtered);
  }, [informationSystems, filterOptions, searchTerm]);

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
      serviceType: 'all',
      status: 'all',
      dateRange: {
        start: null,
        end: null
      }
    });
    setSearchTerm('');
  };

  const getStatusColor = (status: InformationSystem['status']): string => {
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleEditClick = (system: InformationSystem) => {
    setSelectedSystem(system);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (system: InformationSystem) => {
    setSelectedSystem(system);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async (formData: any) => {
    try {
      if (!selectedSystem) return;
      
      await UniversalApplyService.updateAppliedService(selectedSystem.id, formData);
      
      // Refresh the list
      await fetchInformationSystems();
      
      setSnackbar({ open: true, message: 'Information system updated successfully', severity: 'success' });
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating information system:', error);
      setSnackbar({ open: true, message: 'Failed to update information system', severity: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!selectedSystem) return;
      
      await UniversalApplyService.deleteAppliedService(selectedSystem.id);
      
      // Refresh the list
      await fetchInformationSystems();
      
      setSnackbar({ open: true, message: 'Information system deleted successfully', severity: 'success' });
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting information system:', error);
      setSnackbar({ open: true, message: 'Failed to delete information system', severity: 'error' });
    }
  };

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof InformationSystem,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = filteredInformationSystems.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDense(event.target.checked);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredInformationSystems.length) : 0;

  function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) {
        return order;
      }
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  function getComparator<Key extends keyof any>(
    order: 'asc' | 'desc',
    orderBy: Key,
  ): (
    a: { [key in Key]: number | string },
    b: { [key in Key]: number | string },
  ) => number {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

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
          Information System Applications
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage all your information system applications
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
              placeholder="Search by company, contact, or email..."
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

          {/* Service Type Filter */}
          <Grid item xs={12} md={6} lg={3}>
            <TextField
              fullWidth
              select
              label="Service Type"
              value={filterOptions.serviceType}
              onChange={(e) => handleFilterChange('serviceType', e.target.value)}
            >
              {serviceTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {type === 'all' ? 'All Service Types' : type}
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
                  {status === 'all' ? 'All Statuses' : status}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Date Range Filters */}
          <Grid item xs={12} md={6} lg={3}>
            <TextField
              fullWidth
              type="date"
              label="Created Date From"
              InputLabelProps={{ shrink: true }}
              onChange={(e) => handleDateRangeChange('start', e.target.value ? new Date(e.target.value) : null)}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <TextField
              fullWidth
              type="date"
              label="Created Date To"
              InputLabelProps={{ shrink: true }}
              onChange={(e) => handleDateRangeChange('end', e.target.value ? new Date(e.target.value) : null)}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Results Count */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredInformationSystems.length} of {informationSystems.length} information system applications
        </Typography>
      </Box>

      {/* Table Section */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar numSelected={selected.length} onRefresh={fetchInformationSystems} />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={filteredInformationSystems.length}
            />
            <TableBody>
              {stableSort(filteredInformationSystems, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </TableCell>
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                      >
                        {row.companyName}
                      </TableCell>
                      <TableCell align="left">{row.contactName}</TableCell>
                      <TableCell align="left">{row.email}</TableCell>
                      <TableCell align="left">{row.phoneNumber}</TableCell>
                      <TableCell align="left">{row.serviceType}</TableCell>
                      <TableCell align="left">
                        <Chip
                          label={row.status}
                          sx={{ 
                            backgroundColor: getStatusColor(row.status),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="left">{formatDate(row.createdAt)}</TableCell>
                      {/* <TableCell align="left">
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(row);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(row);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell> */}
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                  <TableCell colSpan={9} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredInformationSystems.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Dense padding"
      />

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Information System Application</DialogTitle>
        <DialogContent>
          {selectedSystem && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    defaultValue={selectedSystem.companyName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    defaultValue={selectedSystem.email}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Name"
                    defaultValue={selectedSystem.contactName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    defaultValue={selectedSystem.phoneNumber}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Service Type"
                    defaultValue={selectedSystem.serviceType}
                  >
                    <MenuItem value="Company Deregistration">Company Deregistration</MenuItem>
                    <MenuItem value="Company Registration">Company Registration</MenuItem>
                    <MenuItem value="License Application">License Application</MenuItem>
                    <MenuItem value="Permit Application">Permit Application</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    defaultValue={selectedSystem.status}
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Approved">Approved</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => selectedSystem && handleEditSubmit(selectedSystem)} 
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
            Are you sure you want to delete the information system application for {selectedSystem?.companyName}?
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

export default InformationSystemManagement;
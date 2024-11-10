import React, { useState } from "react";
import {
  Box,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Stack,
  Select,
  Checkbox,
  ListItemText,
  InputLabel,
  FormControl,
  OutlinedInput,
  Badge,
  InputAdornment,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CachedIcon from "@mui/icons-material/Cached";
import Loader from "../Loader";
import { Deployment } from "../../types/Deployment";

// Function to calculate the "age" of a deployment
const calculateAge = (createdAt: string) => {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - createdDate.getTime()) / 1000);
  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(diffInSeconds / 3600);
  const days = Math.floor(diffInSeconds / 86400);

  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  if (minutes < 60) return `${minutes}m ${diffInSeconds % 60}s`;
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  return `${days}d ${hours % 24}h`;
};

// Sorting comparator function
function descendingComparator<T extends Record<string, any>>(a: T, b: T, orderBy: string): number {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator<Order extends string>(order: "asc" | "desc", orderBy: Order) {
  return order === "desc"
    ? (a: any, b: any) => descendingComparator(a, b, orderBy)
    : (a: any, b: any) => -descendingComparator(a, b, orderBy);
}

// Filtering function to match search query
const applyFilter = (deployments: Deployment[], selectedFilters: { [key: string]: string[] }) => {
  const convertLabelsToString = (labels: Record<string, string> | Record<string, string>[] | string): string[] => {
    switch (true) {
      case Array.isArray(labels):
        return labels.flatMap((labelObj) => Object.entries(labelObj).map(([key, value]) => `${key}=${value}`));
      case typeof labels === "object":
        return Object.entries(labels).map(([key, value]) => `${key}=${value}`);
      case typeof labels === "string":
        return [labels];
      default:
        return [];
    }
  };

  return deployments.filter((deployment) => {
    const matchesColumnFilters = Object.keys(selectedFilters).every((column) => {
      const selectedValues = selectedFilters[column];

      if (selectedValues && selectedValues.length > 0 && !selectedValues.includes("All")) {
        // Handle calculated fields manually
        let value: any;

        if (column === "availability") {
          // Calculate availability
          value = deployment.availableReplicas > 0 ? "Available" : "Not Available";
        } else if (column === "labels") {
          // Flatten labels
          value = convertLabelsToString(deployment.labels).join(" ");
        } else if (column === "app") {
          // Filter by application name
          value = deployment.application.name;
        } else {
          // For other columns, use the original value from the deployment
          value = deployment[column as keyof Deployment];
        }

        // If value is an array of strings, check if any of the selected values match
        if (Array.isArray(value)) {
          return selectedValues.some((selectedValue) =>
            value.some((item) => item.toLowerCase().includes(selectedValue.toLowerCase()))
          );
        }

        // Check for direct match on string or number
        if (typeof value === "string") {
          return selectedValues.some((selectedValue) => value.toLowerCase().includes(selectedValue.toLowerCase()));
        } else if (typeof value === "number" || typeof value === "boolean") {
          return selectedValues.some((selectedValue) =>
            value.toString().toLowerCase().includes(selectedValue.toLowerCase())
          );
        }

        return false;
      }

      return true;
    });

    return matchesColumnFilters;
  });
};

interface DeploymentTableProps {
  deployments: Deployment[];
  loading: boolean;
  onEdit: (deployment: Deployment) => void;
  onDelete: (id: string) => void;
  onRefresh: (id: string) => void;
  IsDeplRefreshing: string | null;
  isRefreshing: boolean;
}

const DeploymentTable: React.FC<DeploymentTableProps> = ({
  deployments,
  loading,
  onEdit,
  onDelete,
  onRefresh,
  IsDeplRefreshing,
  isRefreshing,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDeploymentId, setSelectedDeploymentId] = useState<string | null>(null);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<string>("name");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [filterColumn, setFilterColumn] = useState<string | null>(null);
  const [filterValues, setFilterValues] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string[] }>({});
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedDeploymentId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDeploymentId(null);
  };

  const handleEdit = () => {
    if (selectedDeploymentId) {
      const deployment = deployments.find((dep) => dep._id === selectedDeploymentId);
      if (deployment) {
        onEdit(deployment);
      }
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedDeploymentId) {
      onDelete(selectedDeploymentId);
    }
    handleMenuClose();
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const openFilterMenu = (event: React.MouseEvent<HTMLElement>, column: string) => {
    const columnValues = getColumnValues(column);
    setFilterValues(columnValues);
    setFilterColumn(column);
    setFilterMenuAnchor(event.currentTarget);
  };

  const closeFilterMenu = () => {
    setFilterMenuAnchor(null);
  };

  const applyColumnFilter = (values: string[]) => {
    if (filterColumn) {
      setSelectedFilters((prev) => {
        const updatedFilters = { ...prev };

        if (values.length === 0 || values.includes("All")) {
          delete updatedFilters[filterColumn];
        } else {
          updatedFilters[filterColumn] = values;
        }

        return updatedFilters;
      });
    }
    closeFilterMenu();
  };

  // Function to handle the reset of the filter for the column
  const resetColumnFilter = () => {
    setSelectedFilters((prev) => {
      const updatedFilters = { ...prev };
      delete updatedFilters[filterColumn!];
      return updatedFilters;
    });
  };

  const getColumnValues = (column: string) => {
    switch (column) {
      case "name":
        return Array.from(new Set(deployments.map((dep) => dep.name)));
      case "status":
        return Array.from(new Set(deployments.map((dep) => dep.status)));
      case "availability":
        return Array.from(
          new Set(deployments.map((dep) => (dep.availableReplicas > 0 ? "Available" : "Not Available")))
        );
      case "labels":
        return Array.from(
          new Set(deployments.flatMap((dep) => Object.entries(dep.labels).map(([key, value]) => `${key}=${value}`)))
        );
      case "app":
        return Array.from(new Set(deployments.map((dep) => dep.application.name)));
      default:
        return [];
    }
  };

  const filteredDeployments = applyFilter(deployments, selectedFilters);
  const sortedDeployments = filteredDeployments.sort(getComparator(order, orderBy));

  const rows = sortedDeployments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((dep) => ({
    id: dep._id,
    app: dep.application.name,
    name: dep.name,
    status: `${dep.availableReplicas} of ${dep.replicas} pods`,
    availability: dep.availableReplicas > 0 ? "Available" : "Not Available",
    labels: dep.labels ? Object.entries(dep.labels).map(([key, value]) => `${key}=${value}`) : [],
    age: calculateAge(dep.createdAt),
  }));

  const columns = [
    { id: "app", label: "Application Name" },
    { id: "name", label: "Deployment Name" },
    { id: "status", label: "Status" },
    { id: "availability", label: "Availability" },
    { id: "labels", label: "Labels" },
    { id: "age", label: "Age" },
    { id: "actions", label: "Actions" },
  ];

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;

  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  return (
    <Box sx={{ width: "100%" }}>
      {loading ? (
        <Loader />
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    onMouseEnter={() => setHoveredColumn(column.id)}
                    onMouseLeave={() => setHoveredColumn(null)}>
                    {column.id !== "actions" ? (
                      <Stack direction="row" alignItems="center">
                        <TableSortLabel
                          active={orderBy === column.id}
                          direction={orderBy === column.id ? order : "asc"}
                          onClick={() => handleRequestSort(column.id)}>
                          {column.label}
                        </TableSortLabel>
                        <Box sx={{ position: "relative" }}>
                          <IconButton
                            size="small"
                            onClick={(event) => openFilterMenu(event, column.id)}
                            style={{
                              visibility:
                                hoveredColumn === column.id || selectedFilters[column.id]?.length > 0
                                  ? "visible"
                                  : "hidden",
                            }}>
                            <FilterListIcon />
                          </IconButton>
                          {selectedFilters[column.id]?.length > 0 && (
                            <Badge
                              color="secondary"
                              badgeContent={selectedFilters[column.id]?.length}
                              sx={{
                                position: "absolute",
                                top: 0,
                                right: 0,
                                fontSize: 10,
                                backgroundColor: "red",
                              }}
                            />
                          )}
                        </Box>
                      </Stack>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow hover key={row.id}>
                  <TableCell>{row.app}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.availability}</TableCell>
                  <TableCell>{row.labels.join(", ")}</TableCell>
                  <TableCell>{row.age}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => onRefresh(row.id)}>
                      {isRefreshing || IsDeplRefreshing === row.id ? <CircularProgress size={24} /> : <CachedIcon />}
                    </IconButton>
                    <IconButton onClick={(event) => handleMenuClick(event, row.id)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* Filter Menu */}
      <Menu anchorEl={filterMenuAnchor} open={Boolean(filterMenuAnchor)} onClose={closeFilterMenu}>
        <FormControl sx={{ m: 1, width: 300 }}>
          <InputLabel id={`${filterColumn}-label`}>{filterColumn}</InputLabel>
          <Select
            labelId="`${filterColumn}-label`"
            id={filterColumn!}
            multiple
            value={selectedFilters[filterColumn!] || []}
            onChange={(event) =>
              setSelectedFilters((prev) => ({
                ...prev,
                [filterColumn!]: event.target.value as string[],
              }))
            }
            input={<OutlinedInput label={filterColumn} />}
            renderValue={(selected) => selected.join(", ")}
            MenuProps={MenuProps}
            endAdornment={
              <InputAdornment position="start">
                {/* Apply Filter Button */}
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => applyColumnFilter(selectedFilters[filterColumn!] || [])}
                  disabled={!selectedFilters[filterColumn!]?.length}>
                  <FilterListIcon />
                </IconButton>
                {/* Reset Filter Button */}
                <IconButton
                  color="secondary"
                  size="small"
                  onClick={resetColumnFilter}
                  disabled={!selectedFilters[filterColumn!]?.length}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            }>
            {filterValues.map((value) => (
              <MenuItem key={value} value={value}>
                <Checkbox checked={selectedFilters[filterColumn!]?.includes(value)} />
                <ListItemText primary={value} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Menu>
      {/* Edit/Delete Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
      {/* Table Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredDeployments.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default DeploymentTable;

import React, { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  IconButton,
  Menu,
  MenuItem,
  TablePagination,
  Stack,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  // Checkbox,
  // ListItemText,
  Badge,
  Checkbox,
  ListItemText,
  CircularProgress,
  ButtonGroup,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import CachedIcon from "@mui/icons-material/Cached";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  applyFilter,
  getComparator,
  calculateAge,
  getDistinctValues,
  handleRequestSort,
  handleFilterMenuClick,
  closeFilterMenu,
  resetColumnFilter,
} from "../helpers/tableUtils";

interface TableWrapperProps {
  columns: { id: string; label: string }[];
  data: any[];
  onRowAction: (action: string, id: string) => void; // Edit/Delete/Other row actions
  rowActions: { [key: string]: string };
  isRefreshing: boolean;
  initialOrder: "asc" | "desc";
  initialOrderBy: string;
  rowsPerPage: number;
}

const TableWrapper: React.FC<TableWrapperProps> = ({
  columns,
  data,
  onRowAction,
  rowActions,
  isRefreshing,
  initialOrder,
  initialOrderBy,
  rowsPerPage,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [order, setOrder] = useState<"asc" | "desc">(initialOrder);
  const [orderBy, setOrderBy] = useState<string>(initialOrderBy);

  const [page, setPage] = useState(0);
  const [rowsPerPageState, setRowsPerPageState] = useState(rowsPerPage);

  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string[] }>({});
  const [filterColumn, setFilterColumn] = useState<string | null>(null);
  const [refreshedItem, setRefreshedItem] = useState<string | null>(null);

  /**
   * Helper function to get distinct filter values for a given column
   * @param {string} columnId - The column ID to get distinct values for
   * @returns {string[]} - The distinct values for the column
   */
  // const getDistinctValues = (columnId: string) => {
  //   if (columnId === "age") {
  //     return ["Less than 1 day", "1-2 days", "More than 2 days"];
  //   }
  //   const uniqueValues = new Set<string>();
  //   data.forEach((row) => {
  //     if (columnId === "labels" && row[columnId]) {
  //       row[columnId].forEach((label: string) => uniqueValues.add(label)); // Handle "labels" which is an array
  //     } else if (row[columnId]) {
  //       uniqueValues.add(row[columnId].toString()); // Handle other columns
  //     }
  //   });
  //   return Array.from(uniqueValues);
  // };

  /**
   * Helper function to sort the table data based on the given property
   * @param {string} property - The property to sort by
   */
  // const handleRequestSort = (property: string) => {
  //   const isAsc = orderBy === property && order === "asc";
  //   setOrder(isAsc ? "desc" : "asc");
  //   setOrderBy(property);
  // };

  /**
   * Helper function to handle filter menu click for a given column
   * @param {React.MouseEvent<HTMLElement>} event - The click event
   * @param {string} column - The column ID to filter
   */
  // const handleFilterMenuClick = (event: React.MouseEvent<HTMLElement>, column: string) => {
  //   setFilterColumn(column);
  //   setFilterMenuAnchor(event.currentTarget);
  // };

  /**
   * Helper function to close the filter menu
   */
  // const closeFilterMenu = () => setFilterMenuAnchor(null);

  /**
   * Helper function to reset the filter for a given column
   */
  // const resetColumnFilter = () => {
  //   setSelectedFilters((prev) => {
  //     const updatedFilters = { ...prev };
  //     delete updatedFilters[filterColumn!];
  //     return updatedFilters;
  //   });
  // };

  // Filter the data
  const filteredData = applyFilter(data, selectedFilters, (labels: any) => {
    // Convert labels to string here (if needed)
    return Object.entries(labels).map(([key, value]) => `${key}=${value}`);
  }).map((row: any) => ({
    ...row,
    age: calculateAge(row.createdAt), // Calculate the age of the deployment
  }));

  // Sort the data
  const sortedData = filteredData.sort(getComparator(order, orderBy));

  // Paginate the data
  const rows = sortedData.slice(page * rowsPerPageState, page * rowsPerPageState + rowsPerPageState);

  /**
   * Helper function to handle actions menu click
   * @param {React.MouseEvent<HTMLElement>} event - The click event
   * @param {string} id - The ID of the row
   */
  const handleActionsMenuClick = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedRowId(id);
  };

  /**
   * Helper function to close the actions menu
   */
  const handleActionsMenuClose = () => {
    setAnchorEl(null);
    setSelectedRowId(null);
  };

  /**
   * Helper function to handle row actions
   * @param {string} action - The action to perform
   * @param {string} id - The ID of the row
   */
  const handleAction = async (action: string, id: string) => {
    await onRowAction(action, id);
  };

  /**
   * Helper function to handle the edit action
   */
  const handleEdit = () => {
    if (selectedRowId) {
      const item = data.find((element) => element.id === selectedRowId);
      if (item) {
        handleAction(rowActions.edit, item.id);
      }
    }
    handleActionsMenuClose();
  };

  /**
   * Helper function to handle the delete action
   */
  const handleDelete = () => {
    if (selectedRowId) {
      handleAction(rowActions.delete, selectedRowId);
    }
    handleActionsMenuClose();
  };

  /**
   * Helper function to handle the refresh action
   * @param {React.MouseEvent<HTMLElement>} _event - The event object (not used)
   * @param {string} id - The ID of the row
   */
  const handleRefresh = async (_event: React.MouseEvent<HTMLElement>, id: string) => {
    if (id) {
      setRefreshedItem(id);
      await handleAction(rowActions.refresh, id);
    }
    setRefreshedItem(null);
  };

  /**
   * Helper function to handle page change
   * @param {unknown} _event - The event object (not used)
   * @param {number} newPage - The new page number
   */
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  /**
   * Helper function to handle rows per page change
   * @param {React.ChangeEvent<HTMLInputElement>} event - The change event
   */
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPageState(parseInt(event.target.value, 10));
    setPage(0);
  };

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;

  // Menu props
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  return (
    <Box>
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
                        onClick={() => handleRequestSort(column.id, orderBy, order, setOrder, setOrderBy)}>
                        {column.label}
                      </TableSortLabel>
                      <Box sx={{ position: "relative" }}>
                        <IconButton
                          size="small"
                          onClick={(event) =>
                            handleFilterMenuClick(event, column.id, setFilterColumn, setFilterMenuAnchor)
                          }
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
                {columns.map((column) => (
                  <TableCell key={column.id}>{row[column.id]}</TableCell>
                ))}
                <TableCell>
                  <ButtonGroup>
                    <IconButton onClick={(event) => handleRefresh(event, row.id)}>
                      {isRefreshing || refreshedItem === row.id ? <CircularProgress size={24} /> : <CachedIcon />}
                    </IconButton>
                    <IconButton onClick={(event) => handleActionsMenuClick(event, row.id)}>
                      <MoreVertIcon />
                    </IconButton>
                  </ButtonGroup>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => closeFilterMenu(setFilterMenuAnchor)}>
        <FormControl sx={{ m: 1, width: 300 }}>
          <InputLabel id={`${filterColumn}-label`}>{filterColumn}</InputLabel>
          <Select
            labelId={`${filterColumn}-label`}
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
                <IconButton
                  color="secondary"
                  size="small"
                  onClick={() => resetColumnFilter(filterColumn!, setSelectedFilters)}
                  disabled={!selectedFilters[filterColumn!]?.length}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            }>
            {getDistinctValues(filterColumn!, data).map((value) => (
              <MenuItem key={value} value={value}>
                <Checkbox checked={selectedFilters[filterColumn!]?.includes(value)} />
                <ListItemText primary={value} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Menu>

      {/* Edit/Delete Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleActionsMenuClose}>
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPageState}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default TableWrapper;

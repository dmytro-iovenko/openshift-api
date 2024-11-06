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
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import MoreVertIcon from "@mui/icons-material/MoreVert";
// import CachedIcon from "@mui/icons-material/Cached";
import { applyFilter, getComparator, calculateAge } from "../helpers/tableUtils.ts"; // Import helpers

interface TableWrapperProps {
  columns: { id: string; label: string }[];
  data: any[];
  onRowAction: (action: string, id: string) => void; // Edit/Delete/Other row actions
  rowActions: { [key: string]: string };
  initialOrder: "asc" | "desc";
  initialOrderBy: string;
  rowsPerPage: number;
}

const TableWrapper: React.FC<TableWrapperProps> = ({
  columns,
  data,
  onRowAction,
  rowActions,
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
  // const [filterValues, setFilterValues] = useState<string[]>([]);

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleFilterMenuClick = (event: React.MouseEvent<HTMLElement>, column: string) => {
    setFilterColumn(column);
    setFilterMenuAnchor(event.currentTarget);
  };

  const closeFilterMenu = () => setFilterMenuAnchor(null);

  // const handleFilterMenuClose = (values: string[]) => {
  //   setSelectedFilters((prev) => ({
  //     ...prev,
  //     [filterColumn!]: values,
  //   }));
  //   closeFilterMenu();
  // };

  const resetColumnFilter = () => {
    setSelectedFilters((prev) => {
      const updatedFilters = { ...prev };
      delete updatedFilters[filterColumn!];
      return updatedFilters;
    });
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

  const filteredData = applyFilter(data, selectedFilters, (labels: any) => {
    // Convert labels to string here (if needed)
    return Object.entries(labels).map(([key, value]) => `${key}=${value}`);
  });

  const sortedData = filteredData.sort(getComparator(order, orderBy));

  const rows = sortedData
    .slice(page * rowsPerPageState, page * rowsPerPageState + rowsPerPageState)
    .map((row: any) => ({
      ...row,
      age: calculateAge(row.createdAt), // Calculating the age dynamically
    }));

  const handleActionsMenuClick = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedRowId(id);
  };

  const handleActionsMenuClose = () => {
    setAnchorEl(null);
    setSelectedRowId(null);
  };

  const handleAction = (action: string, id: string) => {
    onRowAction(action, id);
  };

  const handleEdit = () => {
    if (selectedRowId) {
      const item = data.find((element) => element.id === selectedRowId);
      if (item) {
        handleAction(rowActions.edit, item.id);
      }
    }
    handleActionsMenuClose();
  };

  const handleDelete = () => {
    if (selectedRowId) {
      handleAction(rowActions.delete, selectedRowId);
    }
    handleActionsMenuClose();
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPageState(parseInt(event.target.value, 10));
    setPage(0);
  };

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
                        onClick={() => handleRequestSort(column.id)}>
                        {column.label}
                      </TableSortLabel>
                      <Box sx={{ position: "relative" }}>
                        <IconButton
                          size="small"
                          onClick={(event) => handleFilterMenuClick(event, column.id)}
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
                  {/* <IconButton onClick={() => handleAction(rowActions.refresh, row.id)}>
                    {false ? <CircularProgress size={24} /> : <CachedIcon />}
                  </IconButton> */}
                  <IconButton onClick={(event) => handleActionsMenuClick(event, row.id)}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
            {/* {filterValues.map((value) => (
              <MenuItem key={value} value={value}>
                <Checkbox checked={selectedFilters[filterColumn!]?.includes(value)} />
                <ListItemText primary={value} />
              </MenuItem>
            ))} */}
          </Select>
        </FormControl>{" "}
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

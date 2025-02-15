import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TableSortLabel,
    Paper,
    Box,
    TextField,
    InputAdornment,
    Typography
} from '@mui/material';
import { Search } from '@mui/icons-material';

const DataTable = ({
    columns,
    data,
    title,
    searchable = true,
    sortable = true,
    pagination = true,
    rowsPerPageOptions = [5, 10, 25],
    defaultRowsPerPage = 10
}) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
    const [searchQuery, setSearchQuery] = useState('');
    const [orderBy, setOrderBy] = useState('');
    const [order, setOrder] = useState('asc');

    const handleSort = (property) => {
        if (!sortable) return;
        
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
        setPage(0);
    };

    const filterData = (data) => {
        if (!searchQuery) return data;

        return data.filter(row =>
            columns.some(column => {
                const value = row[column.field];
                if (value == null) return false;
                return value.toString().toLowerCase().includes(searchQuery.toLowerCase());
            })
        );
    };

    const sortData = (data) => {
        if (!orderBy) return data;

        return [...data].sort((a, b) => {
            const aValue = a[orderBy];
            const bValue = b[orderBy];

            if (aValue == null) return 1;
            if (bValue == null) return -1;

            if (typeof aValue === 'number') {
                return order === 'asc' ? aValue - bValue : bValue - aValue;
            }

            return order === 'asc'
                ? aValue.toString().localeCompare(bValue.toString())
                : bValue.toString().localeCompare(aValue.toString());
        });
    };

    const filteredData = filterData(data);
    const sortedData = sortData(filteredData);
    const paginatedData = pagination
        ? sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        : sortedData;

    return (
        <Paper sx={{ width: '100%', mb: 2 }}>
            <Box sx={{ p: 2 }}>
                {title && (
                    <Typography variant="h6" component="div" sx={{ mb: 2 }}>
                        {title}
                    </Typography>
                )}
                
                {searchable && (
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={handleSearch}
                        sx={{ mb: 2 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                    />
                )}
            </Box>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.field}
                                    align={column.align || 'left'}
                                    sortDirection={orderBy === column.field ? order : false}
                                >
                                    {sortable && column.sortable !== false ? (
                                        <TableSortLabel
                                            active={orderBy === column.field}
                                            direction={orderBy === column.field ? order : 'asc'}
                                            onClick={() => handleSort(column.field)}
                                        >
                                            {column.headerName}
                                        </TableSortLabel>
                                    ) : (
                                        column.headerName
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.map((row, index) => (
                            <TableRow key={row.id || index}>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.field}
                                        align={column.align || 'left'}
                                    >
                                        {column.renderCell
                                            ? column.renderCell(row)
                                            : row[column.field]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {pagination && (
                <TablePagination
                    rowsPerPageOptions={rowsPerPageOptions}
                    component="div"
                    count={filteredData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            )}
        </Paper>
    );
};

export default DataTable; 
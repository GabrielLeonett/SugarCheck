import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
} from '@mui/material';

export interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
}

interface HistorialTableProps<T> {
  columns: Column<T>[];
  data: T[];
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  rowsPerPageOptions?: number[];
  emptyMessage?: string;
  labelRowsPerPage?: string;
  ariaLabel?: string;
}

function HistorialTable<T extends { id: number }>({
  columns,
  data,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [4, 10, 25],
  emptyMessage = '',
  labelRowsPerPage = '',
  ariaLabel = '',
}: HistorialTableProps<T>) {
  const paginatedData = data.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <>
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ mb: 1, borderColor: 'divider' }}
      >
        <Table size="small" aria-label={ariaLabel}>
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key} sx={{ color: '#fff', fontWeight: 700 }}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <TableRow key={row.id} hover>
                  {columns.map((col) => (
                    <TableCell key={col.key} sx={{ color: 'text.secondary' }}>
                      {col.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{ color: 'text.secondary', py: 3 }}
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        labelRowsPerPage={labelRowsPerPage}
      />
    </>
  );
}

export default HistorialTable;

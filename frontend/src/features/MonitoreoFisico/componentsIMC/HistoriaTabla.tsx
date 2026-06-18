import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Box, styled } from '@mui/material';
import type { PhysicalRecord, MeasurementState } from "../../../types/types";

interface HistoryTableProps {
  records: PhysicalRecord[];
}

const StyledTableContainer = styled(TableContainer)(() => ({
  border: '1px solid #E5E8E8',
  borderRadius: '8px',
  overflow: 'hidden',
}));

const HeaderCell = styled(TableCell)(() => ({
  backgroundColor: '#5D9CEC',
  color: '#FFFFFF',
  fontWeight: 600,
  fontSize: '0.9rem',
  padding: '12px 16px',
}));

const BodyCell = styled(TableCell)(() => ({
  color: '#34495E',
  fontSize: '0.875rem',
  padding: '12px 16px',
  borderBottom: '1px solid #F2F4F4',
}));

const StateBadge = ({ state }: { state: MeasurementState }) => {
  const styles = {
    'Normal': { color: '#2ECC71', fontWeight: 700 },
    'Sobrepeso': { color: '#E67E22', fontWeight: 700 },
    'Bajo peso': { color: '#3498DB', fontWeight: 700 },
  };

  return (
    <Box sx={styles[state]}>
      {state}
    </Box>
  );
};

export const HistoryTable: React.FC<HistoryTableProps> = ({ records }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <StyledTableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <HeaderCell>Fecha</HeaderCell>
              <HeaderCell>Peso (Kg)</HeaderCell>
              <HeaderCell>Estatura (cm)</HeaderCell>
              <HeaderCell>IMC</HeaderCell>
              <HeaderCell>Estado</HeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((record) => (
              <TableRow key={record.id} hover>
                <BodyCell>{record.fecha}</BodyCell>
                <BodyCell>{record.peso.toFixed(1)}</BodyCell>
                <BodyCell>{record.estatura}</BodyCell>
                <BodyCell>{record.imc.toFixed(1)}</BodyCell>
                <BodyCell>
                  <StateBadge state={record.estado} />
                </BodyCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
      <TablePagination
        rowsPerPageOptions={[4, 10, 25]}
        component="div"
        count={records.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        sx={{ color: '#7F8C8D', borderTop: 'none' }}
      />
    </Box>
  );
};
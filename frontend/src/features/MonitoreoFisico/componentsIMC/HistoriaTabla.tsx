import React, { useState } from 'react';
import { 
  Box,
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TablePagination,
  useTheme
} from '@mui/material';
import type { PhysicalRecord } from '../../../types/types';
import useLanguage from "../../../hooks/useLanguage";

interface HistoryTableProps {
  records: PhysicalRecord[];
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ records }) => {
  const { t } = useLanguage("monitoreoFisico");
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Volver a la primera página al cambiar la cantidad de filas
  };

  // Función auxiliar para determinar el color del estado
  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Normal':
        return '#27AE60'; // Verde
      case 'Sobrepeso':
        return '#E67E22'; // Naranja
      case 'Bajo peso':
        return '#3498DB'; // Azul
      default:
        return '#34495E';
    }
  };

  return (
    <Box sx={{ width: '100%', mt: 4 }}>
      <TableContainer 
        sx={{ 
          border: `1px solid ${theme.palette.divider}`, 
          borderRadius: '8px 8px 0 0',
          backgroundColor: theme.palette.background.paper
        }}
      >
        <Table aria-label="Bitácora histórica">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>{t("tableFecha")}</TableCell>
              <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>{t("tablePeso")}</TableCell>
              <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>{t("tableEstatura")}</TableCell>
              <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>{t("tableImc")}</TableCell>
              <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>{t("tableEstado")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((record) => (
                <TableRow 
                  key={record.id} 
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell sx={{ color: theme.palette.text.primary }}>{record.fecha}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{record.peso}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{record.estatura}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{record.imc.toFixed(1)}</TableCell>
                  <TableCell sx={{ color: getStatusColor(record.estado), fontWeight: 700 }}>
                    {record.estado}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[4, 8, 12]}
        component="div"
        count={records.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage={t("rowsPerPage")}
        labelDisplayedRows={({ from, to, count }) => t("displayedRows", { from, to, count: count !== -1 ? count : `más de ${to}` })}
        sx={{ 
          border: `1px solid ${theme.palette.divider}`, 
          borderTop: 'none', 
          borderRadius: '0 0 8px 8px',
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.secondary
        }}
      />
    </Box>
  );
};
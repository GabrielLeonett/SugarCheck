import React, { useState } from 'react';
import { 
  Box,
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TablePagination
} from '@mui/material';
import type { PhysicalRecord } from '../../../types/types';
import useLanguage from "../../../hooks/useLanguage";

interface HistoryTableProps {
  records: PhysicalRecord[];
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ records }) => {
  const { t } = useLanguage("monitoreoFisico");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4);

  const handleChangePage = (event: unknown, newPage: number) => {
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
          border: '1px solid #CCD5DE', 
          borderRadius: '8px 8px 0 0', // Solo redondea arriba para que coincida con la paginación abajo
          backgroundColor: '#FFFFFF'
        }}
      >
        <Table aria-label="Bitácora histórica">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#7FB3D5' /* Color azul del encabezado */ }}>
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
                  <TableCell sx={{ color: '#34495E' }}>{record.fecha}</TableCell>
                  <TableCell sx={{ color: '#34495E' }}>{record.peso}</TableCell>
                  <TableCell sx={{ color: '#34495E' }}>{record.estatura}</TableCell>
                  <TableCell sx={{ color: '#34495E' }}>{record.imc.toFixed(1)}</TableCell>
                  <TableCell sx={{ color: getStatusColor(record.estado), fontWeight: 700 }}>
                    {record.estado}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Paginación estilo Material UI acoplada a la tabla */}
      <TablePagination
        rowsPerPageOptions={[4, 8, 12]} // Opciones para el usuario
        component="div"
        count={records.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage={t("rowsPerPage")}
        labelDisplayedRows={({ from, to, count }) => t("displayedRows", { from, to, count: count !== -1 ? count : `más de ${to}` })}
        sx={{ 
          border: '1px solid #CCD5DE', 
          borderTop: 'none', 
          borderRadius: '0 0 8px 8px',
          backgroundColor: '#FFFFFF',
          color: '#7F8C8D'
        }}
      />
    </Box>
  );
};
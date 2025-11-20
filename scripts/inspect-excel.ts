import { join } from 'path';
import ExcelJS from 'exceljs';

/**
 * Script para inspeccionar la estructura del archivo Excel
 */
const inspectExcel = async (): Promise<void> => {
  try {
    const excelPath = join(__dirname, '..', 'bailey.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelPath);
    
    console.log('📊 Información del archivo Excel:\n');
    console.log(`Total de hojas: ${workbook.worksheets.length}\n`);
    
    workbook.worksheets.forEach((worksheet, index) => {
      console.log(`--- Hoja ${index + 1}: ${worksheet.name} ---`);
      console.log(`Total de filas: ${worksheet.rowCount}`);
      console.log(`Total de columnas: ${worksheet.columnCount}\n`);
      
      // Mostrar primeras 5 filas
      console.log('Primeras 5 filas:');
      let rowCount = 0;
      worksheet.eachRow((row, rowNumber) => {
        if (rowCount < 5) {
          const values = row.values as any[];
          console.log(`Fila ${rowNumber}:`, values);
          rowCount++;
        }
      });
      console.log('\n');
    });
    
  } catch (error) {
    console.error('❌ Error al leer el archivo Excel:', error);
  }
};

inspectExcel();

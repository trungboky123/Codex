package main.utils;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;

public class XLSXUtil {
    public static String getCell(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null) return null;

        cell.setCellType(CellType.STRING);
        return cell.getStringCellValue().trim();
    }
}

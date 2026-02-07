package main.utils;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;

import java.util.Arrays;

public class XLSXUtil {
    public static String getCell(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null) return null;

        cell.setCellType(CellType.STRING);
        return cell.getStringCellValue().trim();
    }

    public static String[] parseMultipleData(Cell cell) {
        if (cell == null) {
            return new String[0];
        }

        String raw = cell.getStringCellValue().trim();
        if (raw.isEmpty()) {
            return new String[0];
        }

        return Arrays.stream(raw.split("\\|")).map(String::trim).filter(s -> !s.isEmpty()).toArray(String[]::new);
    }

    public static String normalizeName(String input) {
        String s = input.trim().toLowerCase();
        return s.substring(0, 1).toUpperCase() + s.substring(1);
    }
}

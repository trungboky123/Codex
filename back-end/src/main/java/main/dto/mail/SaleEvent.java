package main.dto.mail;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SaleEvent {
    private final Integer id;
    private final String type;
    private final String name;
    private final String listedPrice;
    private final String salePrice;
    private final String thumbnailUrl;
}

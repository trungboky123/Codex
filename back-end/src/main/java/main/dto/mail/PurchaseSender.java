package main.dto.mail;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PurchaseSender {
    private final String username;
    private final String email;
    private final Integer itemId;
    private final String type;
}

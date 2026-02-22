package main.exception;

import lombok.Getter;

@Getter
public class MessageException extends RuntimeException {
    private final Object[] args;

    public MessageException(String messageKey, Object... args) {
        super(messageKey);
        this.args = args;
    }
}

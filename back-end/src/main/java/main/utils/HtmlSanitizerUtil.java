package main.utils;

import org.owasp.html.PolicyFactory;
import org.owasp.html.Sanitizers;

public class HtmlSanitizerUtil {
    private static final PolicyFactory POLICY = Sanitizers.FORMATTING
            .and(Sanitizers.BLOCKS)
            .and(Sanitizers.LINKS)
            .and(Sanitizers.IMAGES);

    public static String sanitize(String html) {
        if (html == null) {
            return null;
        }

        return POLICY.sanitize(html);
    }
}

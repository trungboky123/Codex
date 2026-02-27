package main.configuration;

import lombok.RequiredArgsConstructor;
import main.dto.mail.CodeSender;
import main.dto.mail.PurchaseSender;
import main.dto.mail.SaleEvent;
import main.entity.Class;
import main.entity.Course;
import main.entity.User;
import main.entity.Wishlist;
import main.repository.ClassRepository;
import main.repository.CourseRepository;
import main.repository.WishlistRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import java.util.List;

@Component
@RequiredArgsConstructor
public class EmailSender {
    private final WishlistRepository wishlistRepository;
    private final MailService mailService;
    private final CourseRepository courseRepository;
    private final ClassRepository classRepository;

    @Async("mailExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleNotifySale(SaleEvent saleEvent) {
        List<Wishlist> wishlists = wishlistRepository.findByItemIdAndType(saleEvent.getId(), saleEvent.getType());
        for (Wishlist w : wishlists) {
            User user = w.getUser();
            String email = user.getEmail();
            mailService.notifySale(email, saleEvent.getName(), saleEvent.getType(), saleEvent.getListedPrice(), saleEvent.getSalePrice(), saleEvent.getThumbnailUrl());
        }
    }

    @Async("codeExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleSendCode(CodeSender codeSender) {
        mailService.sendCode(codeSender.getToEmail(), codeSender.getCode());
    }

    @Async("purchaseExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleSendPurchase(PurchaseSender info) {
        if ("Course".equalsIgnoreCase(info.getType())) {
            Course course = courseRepository.findById(info.getItemId()).orElseThrow(() -> new RuntimeException("course.notFound"));
            mailService.purchaseSuccess(info.getEmail(), info.getUsername(), info.getType(), course.getName());
        }

        else {
            Class clazz = classRepository.findById(info.getItemId()).orElseThrow(() -> new RuntimeException("class.notFound"));
            mailService.purchaseSuccess(info.getEmail(), info.getUsername(), info.getType(), clazz.getName());
        }
    }
}

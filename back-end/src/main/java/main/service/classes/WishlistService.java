package main.service.classes;

import lombok.RequiredArgsConstructor;
import main.dto.request.WishlistRequest;
import main.entity.User;
import main.entity.Wishlist;
import main.repository.UserRepository;
import main.repository.WishlistRepository;
import main.service.interfaces.IWishlistService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WishlistService implements IWishlistService {
    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;

    @Override
    public void addToWishlist(Integer userId, WishlistRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found!"));
        if (wishlistRepository.existsByUserAndItemIdAndType(user, request.getItemId(), request.getType())) {
            throw new RuntimeException("Item has already existed in wishlist!");
        }

        Wishlist wishlist = new Wishlist();
        wishlist.setUser(user);
        wishlist.setType();
    }
}

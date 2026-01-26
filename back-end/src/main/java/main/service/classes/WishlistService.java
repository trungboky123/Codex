package main.service.classes;

import lombok.RequiredArgsConstructor;
import main.dto.request.WishlistRequest;
import main.dto.response.WishlistResponse;
import main.entity.User;
import main.entity.Wishlist;
import main.repository.UserRepository;
import main.repository.WishlistRepository;
import main.service.interfaces.IWishlistService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class WishlistService implements IWishlistService {
    private final ModelMapper modelMapper;
    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;

    @Transactional
    @Override
    public void addToWishlist(Integer userId, WishlistRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found!"));
        if (wishlistRepository.existsByUserAndItemIdAndType(user, request.getItemId(), request.getType())) {
            throw new RuntimeException("Item has already existed in wishlist!");
        }

        Wishlist wishlist = new Wishlist();
        wishlist.setType(request.getType());
        wishlist.setItemId(request.getItemId());
        wishlist.setItemName(request.getItemName());
        wishlist.setListedPrice(request.getListedPrice());
        wishlist.setSalePrice(request.getSalePrice());
        wishlist.setUser(user);
        wishlist.setAddedAt(LocalDateTime.now());

        wishlistRepository.save(wishlist);
    }

    @Override
    public WishlistResponse findItem(Integer userId, Integer itemId, String type) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found!"));
        Wishlist wishlist = wishlistRepository.findByUserAndItemIdAndType(user, itemId, type).orElseThrow(() -> new RuntimeException("Item not found!"));
        return modelMapper.map(wishlist, WishlistResponse.class);
    }
}

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
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
        wishlist.setThumbnailUrl(request.getThumbnailUrl());
        wishlist.setAddedAt(LocalDateTime.now());

        wishlistRepository.save(wishlist);
    }

    @Override
    public WishlistResponse findItem(Integer userId, Integer itemId, String type) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found!"));
        Wishlist wishlist = wishlistRepository.findByUserAndItemIdAndType(user, itemId, type).orElseThrow(() -> new RuntimeException("Item not found!"));
        return modelMapper.map(wishlist, WishlistResponse.class);
    }

    @Override
    public List<WishlistResponse> findByUserId(Integer userId, String keyword, String sortBy) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found!"));
        List<Wishlist> items = switch (sortBy == null ? "" : sortBy.toLowerCase()) {
            case "price-asc" -> wishlistRepository.findAllByUserSortByPriceAsc(user, keyword);
            case "price-desc" -> wishlistRepository.findAllByUserSortByPriceDesc(user, keyword);
            case "date-asc" -> wishlistRepository.findAllByUser(
                    user, keyword, Sort.by("addedAt").ascending());
            case "date-desc" -> wishlistRepository.findAllByUser(
                    user, keyword, Sort.by("addedAt").descending());
            default -> wishlistRepository.findAllByUser(
                    user, keyword, Sort.by("id").ascending());
        };
        return items.stream().map(item -> modelMapper.map(item, WishlistResponse.class)).toList();
    }

    @Transactional
    @Override
    public void deleteItem(Integer userId, Integer itemId, String type) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found!"));
        Wishlist wishlist = wishlistRepository.findByUserAndItemIdAndType(user, itemId, type).orElseThrow(() -> new RuntimeException("Item not found!"));
        wishlistRepository.delete(wishlist);
    }
}

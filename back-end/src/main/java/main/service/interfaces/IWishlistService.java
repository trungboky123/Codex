package main.service.interfaces;

import main.dto.request.WishlistRequest;
import main.dto.response.WishlistResponse;

import java.util.List;

public interface IWishlistService {
    void addToWishlist(Integer userId, WishlistRequest request);
    WishlistResponse findItem(Integer userId, Integer itemId, String type);
    List<WishlistResponse> findByUserId(Integer userId, String keyword, String sortBy);
    void deleteItem(Integer userId, Integer itemId, String type);
}

package main.service.interfaces;

import main.dto.request.WishlistRequest;
import main.dto.response.WishlistResponse;

public interface IWishlistService {
    void addToWishlist(Integer userId, WishlistRequest request);
    WishlistResponse findItem(Integer userId, Integer itemId, String type);
}

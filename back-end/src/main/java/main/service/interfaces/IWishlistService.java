package main.service.interfaces;

import main.dto.request.WishlistRequest;

public interface IWishlistService {
    void addToWishlist(Integer userId, WishlistRequest request);
}

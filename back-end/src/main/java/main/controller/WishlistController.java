package main.controller;

import lombok.RequiredArgsConstructor;
import main.configuration.CustomUserDetails;
import main.dto.request.WishlistRequest;
import main.dto.response.WishlistResponse;
import main.service.interfaces.IWishlistService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin("http://localhost:3000")
@RequestMapping("/wishlist")
@RequiredArgsConstructor
public class WishlistController {
    private final IWishlistService wishlistService;

    @PostMapping("/add")
    public ResponseEntity<?> addToWishlist(Authentication authentication, @RequestBody WishlistRequest request) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Integer userId = userDetails.getId();
        wishlistService.addToWishlist(userId, request);

        return ResponseEntity.ok(Map.of(
                "message", "Added to your wishlist!"
        ));
    }

    @GetMapping("/find")
    public ResponseEntity<?> findItem(Authentication authentication, @RequestParam Integer itemId, @RequestParam String type) {
        System.out.println(authentication);
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Integer userId = userDetails.getId();
        WishlistResponse response = wishlistService.findItem(userId, itemId, type);
        return ResponseEntity.ok(response);
    }
}

package main.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import main.configuration.CustomUserDetailsService;
import main.configuration.JwtService;
import main.configuration.MailService;
import main.configuration.RegisterCheckService;
import main.dto.request.LoginRequest;
import main.dto.request.OtpRequest;
import main.dto.request.RegisterRequest;
import main.dto.request.ResetPasswordRequest;
import main.entity.Otp;
import main.entity.RefreshToken;
import main.entity.User;
import main.service.interfaces.IOtpService;
import main.service.interfaces.IRefreshTokenService;
import main.service.interfaces.IUserService;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.WebUtils;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Map;

@RestController
@CrossOrigin("http://localhost:3000")
@RequestMapping("/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final IUserService userService;
    private final IOtpService otpService;
    private final RegisterCheckService registerCheckService;
    private final MessageSource messageSource;
    private final JwtService jwtService;
    private final IRefreshTokenService refreshTokenService;
    private final CustomUserDetailsService customUserDetailsService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        Locale locale = LocaleContextHolder.getLocale();
        try {
            Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsernameOrEmail(), request.getPassword()));

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userService.getUserByUsername(userDetails.getUsername());

            String accessToken = jwtService.generateAccessToken(userDetails);
            RefreshToken token = refreshTokenService.createRefreshToken(user);

            System.out.println(request.isRememberMe());

            Cookie cookie1 = new Cookie("refreshToken", token.getToken());
            cookie1.setHttpOnly(true);
            cookie1.setSecure(false);
            cookie1.setPath("/");
            if (request.isRememberMe()) {
                cookie1.setMaxAge(30 * 24 * 60 * 60);
            }
            else {
                cookie1.setMaxAge(24 * 60 * 60);
            }

            Cookie cookie2 = new Cookie("accessToken", accessToken);
            cookie2.setHttpOnly(true);
            cookie2.setSecure(false);
            cookie2.setPath("/");
            cookie2.setMaxAge(15 * 60);

            response.addCookie(cookie1);
            response.addCookie(cookie2);

            return ResponseEntity.ok(Map.of(
                    "message", messageSource.getMessage("login.success", null, locale),
                    "accessToken", accessToken
            ));
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("password.incorrect");
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@CookieValue(value = "refreshToken", required = false) String refreshToken, HttpServletResponse response) {

        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        RefreshToken token = refreshTokenService
                .findByToken(refreshToken)
                .map(refreshTokenService::verifyExpiration)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid Refresh Token"));

        User user = token.getUser();

        UserDetails userDetails =
                customUserDetailsService.loadUserByUsername(user.getUsername());

        String newAccessToken = jwtService.generateAccessToken(userDetails);

        Cookie cookie = new Cookie("accessToken", newAccessToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(15 * 60);

        response.addCookie(cookie);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {

        Cookie cookie = WebUtils.getCookie(request, "refreshToken");

        if (cookie != null) {
            refreshTokenService.deleteByToken(cookie.getValue());
        }

        Cookie cookie1 = new Cookie("refreshToken", null);
        cookie1.setHttpOnly(true);
        cookie1.setSecure(false);
        cookie1.setPath("/");
        cookie1.setMaxAge(0);

        Cookie cookie2 = new Cookie("accessToken", null);
        cookie2.setHttpOnly(true);
        cookie2.setSecure(false);
        cookie2.setPath("/");
        cookie2.setMaxAge(0);

        response.addCookie(cookie1);
        response.addCookie(cookie2);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        userService.register(request);
        return ResponseEntity.ok(Map.of(
                "message", "Register successfully!"
        ));
    }

    @PostMapping("/send-code")
    public ResponseEntity<?> sendCode(@Valid @RequestBody RegisterRequest request) {
        registerCheckService.checkInfo(request);
        otpService.sendCode(request.getEmail());

        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody OtpRequest request) {
        otpService.verifyOtp(request.getEmail(), request.getCode());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        boolean result = userService.findUserByEmail(email);
        if (result) {
            otpService.sendCode(email);

            return ResponseEntity.ok(Map.of(
                    "message", "Verification Code has been sent to your email!"
            ));
        }

        return ResponseEntity.badRequest().body(Map.of(
                "message", "Account not found!"
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request.getEmail(), request.getCode(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }
}

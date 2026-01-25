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
import main.entity.Otp;
import main.entity.RefreshToken;
import main.entity.User;
import main.service.interfaces.IOtpService;
import main.service.interfaces.IRefreshTokenService;
import main.service.interfaces.IUserService;
import org.springframework.http.HttpStatus;
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
    private final MailService mailService;
    private final PasswordEncoder passwordEncoder;
    private final RegisterCheckService registerCheckService;
    private final JwtService jwtService;
    private final IRefreshTokenService refreshTokenService;
    private final CustomUserDetailsService customUserDetailsService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        try {
            Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsernameOrEmail(), request.getPassword()));

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userService.getUserByUsername(userDetails.getUsername());

            String accessToken = jwtService.generateAccessToken(userDetails);
            RefreshToken token = refreshTokenService.createRefreshToken(user);

            Cookie cookie = new Cookie("refreshToken", token.getToken());
            cookie.setHttpOnly(true);
            cookie.setSecure(false);
            cookie.setPath("/");
            cookie.setMaxAge(7 * 24 * 60 * 60);

            response.addCookie(cookie);

            return ResponseEntity.ok(Map.of(
                    "message", "Login successfully",
                    "accessToken", accessToken
            ));
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Incorrect Password");
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@CookieValue(value = "refreshToken", required = false) String refreshToken) {
        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "message", "Refresh Token Missing",
                    "code", "NO_REFRESH_TOKEN"
            ));
        }

        RefreshToken token = refreshTokenService.findByToken(refreshToken).map(refreshTokenService::verifyExpiration).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Refresh Token"));

        User user = token.getUser();
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(user.getUsername());
        String newAccessToken = jwtService.generateAccessToken(userDetails);

        return ResponseEntity.ok(Map.of(
                "accessToken", newAccessToken
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        Cookie cookie = WebUtils.getCookie(request, "refreshToken");

        if (cookie != null) {
            refreshTokenService.deleteByToken(cookie.getValue());
            cookie.setValue(null);
            cookie.setSecure(false);
            cookie.setHttpOnly(true);
            cookie.setPath("/");
            cookie.setMaxAge(0);

            response.addCookie(cookie);
        }

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
        String code = otpService.generateOtp();
        String codeHashed = passwordEncoder.encode(code);

        Otp otp = new Otp();
        otp.setEmail(request.getEmail());
        otp.setOtpHash(codeHashed);
        otp.setCreatedAt(LocalDateTime.now());
        otp.setExpiredDate(LocalDateTime.now().plusMinutes(5));

        otpService.saveOtp(otp);
        mailService.sendCode(request.getEmail(), code);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody OtpRequest request) {
        otpService.verifyOtp(request.getEmail(), request.getCode());
        return ResponseEntity.ok().build();
    }
}

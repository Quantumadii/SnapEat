package com.snapeat.security;


import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {
	 private final JwtUtil jwtUtil;
	    private final CustomUserDetailsService userDetailsService;

	    @Override
	    protected void doFilterInternal(HttpServletRequest request,
	                                    HttpServletResponse response,
	                                    FilterChain chain)
	            throws ServletException, IOException {
	        try {
	            String header = request.getHeader("Authorization");
	            if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
	                String token = header.substring(7);
	                String email = jwtUtil.extractEmail(token);
	                UserDetails ud = userDetailsService.loadUserByUsername(email);
	                if (jwtUtil.validate(token, ud)) {
	                    var auth = new UsernamePasswordAuthenticationToken(
	                            ud, null, ud.getAuthorities());
	                    SecurityContextHolder.getContext().setAuthentication(auth);
	                }
	            }
	        } catch (Exception e) {
	            log.warn("JWT filter error: {}", e.getMessage());
	        }
	        chain.doFilter(request, response);
	    }
}

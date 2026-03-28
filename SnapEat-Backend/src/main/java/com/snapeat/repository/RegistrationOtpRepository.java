package com.snapeat.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.snapeat.entity.RegistrationOtp;

@Repository
public interface RegistrationOtpRepository extends JpaRepository<RegistrationOtp, Long> {

    Optional<RegistrationOtp> findByEmail(String email);

    void deleteByEmail(String email);
}

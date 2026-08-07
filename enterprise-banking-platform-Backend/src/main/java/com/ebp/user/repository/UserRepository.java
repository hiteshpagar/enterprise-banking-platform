	package com.ebp.user.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ebp.user.entity.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

	Optional<User> findById(UUID id);

	Optional<User> findByUsername(String username);

	Optional<User> findByEmail(String email);

	boolean existsByUsername(String username);

	boolean existsByEmail(String email);
	
	Page<User> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
	        String username,
	        String email,
	        Pageable pageable);
}
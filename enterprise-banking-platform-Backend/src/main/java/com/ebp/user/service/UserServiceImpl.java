package com.ebp.user.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ebp.user.dto.CreateUserRequest;
import com.ebp.user.dto.UpdateUserRequest;
import com.ebp.user.dto.UserResponse;
import com.ebp.user.dto.UserSummaryResponse;
import com.ebp.user.entity.User;
import java.util.Optional;
import com.ebp.user.exception.UserAlreadyExistsException;
import com.ebp.user.exception.UserNotFoundException;
import com.ebp.user.mapper.UserMapper;
import com.ebp.user.repository.UserRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import com.ebp.common.dto.PageResponse;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public UserServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            UserMapper userMapper) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
    }

    @Override
    public UserResponse createUser(CreateUserRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException(
                    "User with username '" + request.getUsername() + "' already exists.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException(
                    "User with email '" + request.getEmail() + "' already exists.");
        }

        User user = userMapper.toEntity(request);

        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);

        return userMapper.toResponse(savedUser);
    }

    @Override
    public UserResponse getUserById(UUID id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User with ID '" + id + "' not found."));

        return userMapper.toResponse(user);
    }

    @Override
    public PageResponse<UserSummaryResponse> getAllUsers(
    		String search,
            int page,
            int size,
            String sortBy,
            String sortDirection) {

        Sort sort = sortDirection.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<User> users = userRepository.findAll(pageable);

        PageResponse<UserSummaryResponse> response =
                new PageResponse<>();

        response.setContent(
                users.getContent()
                        .stream()
                        .map(userMapper::toSummary)
                        .toList());

        response.setPage(users.getNumber());
        response.setSize(users.getSize());
        response.setTotalElements(users.getTotalElements());
        response.setTotalPages(users.getTotalPages());
        response.setFirst(users.isFirst());
        response.setLast(users.isLast());

        return response;
    }

    @Override
    public UserResponse updateUser(UUID id, UpdateUserRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User with ID '" + id + "' not found."));

        Optional<User> existingUsername = userRepository.findByUsername(request.getUsername());

        if (existingUsername.isPresent()
                && !existingUsername.get().getId().equals(user.getId())) {

            throw new UserAlreadyExistsException(
                    "User with username '" + request.getUsername() + "' already exists.");
        }

        Optional<User> existingEmail = userRepository.findByEmail(request.getEmail());

        if (existingEmail.isPresent()
                && !existingEmail.get().getId().equals(user.getId())) {

            throw new UserAlreadyExistsException(
                    "User with email '" + request.getEmail() + "' already exists.");
        }

        userMapper.updateEntity(user, request);

        User updatedUser = userRepository.save(user);

        return userMapper.toResponse(updatedUser);
    }
    @Override
    public void deleteUser(UUID id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User with ID '" + id + "' not found."));

        userRepository.delete(user);
    }
}
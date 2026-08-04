package com.ebp.security.userdetails;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.ebp.permission.entity.Permission;
import com.ebp.role.entity.Role;
import com.ebp.rolepermission.entity.RolePermission;
import com.ebp.rolepermission.repository.RolePermissionRepository;
import com.ebp.user.entity.User;
import com.ebp.user.repository.UserRepository;
import com.ebp.userrole.entity.UserRole;
import com.ebp.userrole.repository.UserRoleRepository;

import lombok.RequiredArgsConstructor;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    
    public CustomUserDetailsService(
            UserRepository userRepository,
            UserRoleRepository userRoleRepository,
            RolePermissionRepository rolePermissionRepository) {

        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.rolePermissionRepository = rolePermissionRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found: " + username));

        Set<GrantedAuthority> authorities = new HashSet<>();

        List<UserRole> userRoles = userRoleRepository.findByUser(user);

        for (UserRole userRole : userRoles) {

            Role role = userRole.getRole();

            authorities.add(
                    new SimpleGrantedAuthority("ROLE_" + role.getName()));

            List<RolePermission> rolePermissions =
                    rolePermissionRepository.findByRole(role);

            for (RolePermission rolePermission : rolePermissions) {

                Permission permission = rolePermission.getPermission();

                authorities.add(
                        new SimpleGrantedAuthority(permission.getName()));
            }
        }

        return new CustomUserDetails(user, authorities);
    }
}
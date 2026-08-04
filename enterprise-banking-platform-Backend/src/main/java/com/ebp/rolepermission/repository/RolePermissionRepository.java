package com.ebp.rolepermission.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ebp.role.entity.Role;
import com.ebp.rolepermission.entity.RolePermission;
import com.ebp.rolepermission.entity.RolePermissionId;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, RolePermissionId> {

    List<RolePermission> findByRole(Role role);

}
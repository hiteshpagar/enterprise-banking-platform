package com.ebp.userrole.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ebp.user.entity.User;
import com.ebp.userrole.entity.UserRole;
import com.ebp.userrole.entity.UserRoleId;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {

    List<UserRole> findByUser(User user);

}
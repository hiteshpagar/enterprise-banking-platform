package com.ebp.rolepermission.entity;

import java.time.OffsetDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.ebp.permission.entity.Permission;
import com.ebp.role.entity.Role;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "role_permissions", schema = "security")
public class RolePermission {

    @EmbeddedId
    private RolePermissionId id;

    @ManyToOne(optional = false)
    @MapsId("roleId")
    @JoinColumn(name = "role_id")
    private Role role;

    public RolePermissionId getId() {
		return id;
	}

	public void setId(RolePermissionId id) {
		this.id = id;
	}

	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}

	public Permission getPermission() {
		return permission;
	}

	public void setPermission(Permission permission) {
		this.permission = permission;
	}

	public OffsetDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(OffsetDateTime createdAt) {
		this.createdAt = createdAt;
	}

	@ManyToOne(optional = false)
    @MapsId("permissionId")
    @JoinColumn(name = "permission_id")
    private Permission permission;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
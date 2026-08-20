package com.ebp.beneficiary.controller;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.filter.OrderedFilter;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import com.ebp.beneficiary.dto.BeneficiaryResponse;
import com.ebp.beneficiary.dto.CreateBeneficiaryRequest;
import com.ebp.beneficiary.dto.CreateCustomerBeneficiaryRequest;
import com.ebp.beneficiary.dto.UpdateBeneficiaryRequest;
import com.ebp.beneficiary.entity.BeneficiaryStatus;
import com.ebp.beneficiary.exception.BeneficiaryNotFoundException;
import com.ebp.beneficiary.service.BeneficiaryService;
import com.ebp.common.exception.GlobalExceptionHandler;
import com.ebp.security.config.SecurityConfig;
import com.ebp.security.filter.JwtAuthenticationFilter;
import com.ebp.security.userdetails.CustomUserDetailsService;
import com.fasterxml.jackson.databind.ObjectMapper;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BeneficiaryController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class BeneficiaryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private BeneficiaryService beneficiaryService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private UUID beneficiaryId;
    private UUID customerId;
    private UUID accountId;
    private BeneficiaryResponse response;

    @BeforeEach
    void setUp() {
        beneficiaryId = UUID.randomUUID();
        customerId = UUID.randomUUID();
        accountId = UUID.randomUUID();

        response = new BeneficiaryResponse();
        response.setId(beneficiaryId);
        response.setCustomerId(customerId);
        response.setAccountId(accountId);
        response.setBeneficiaryName("Jane Doe");
        response.setBankName("Apex Bank");
        response.setAccountNumber("1234567890");
        response.setStatus(BeneficiaryStatus.ACTIVE);
        response.setCreatedAt(OffsetDateTime.now());
        response.setUpdatedAt(OffsetDateTime.now());
    }

    // Customer /me endpoints with CUSTOMER role
    @Test
    @WithMockUser(username = "customer_user", roles = {"CUSTOMER"})
    @DisplayName("GET /api/beneficiaries/me returns beneficiaries for authenticated customer")
    void getCurrentCustomerBeneficiaries_Success() throws Exception {
        when(beneficiaryService.getCurrentCustomerBeneficiaries(eq(0), eq(10), anyString()))
                .thenReturn(new PageImpl<>(List.of(response)));

        mockMvc.perform(get("/api/beneficiaries/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(beneficiaryId.toString()))
                .andExpect(jsonPath("$.content[0].beneficiaryName").value("Jane Doe"));
    }

    @Test
    @WithMockUser(username = "staff_user", roles = {"ADMIN"})
    @DisplayName("GET /api/beneficiaries/me is forbidden without CUSTOMER role")
    void getCurrentCustomerBeneficiaries_ForbiddenWithoutCustomerRole() throws Exception {
        mockMvc.perform(get("/api/beneficiaries/me"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "customer_user", roles = {"CUSTOMER"})
    @DisplayName("POST /api/beneficiaries/me creates beneficiary for current customer")
    void createCustomerBeneficiary_Success() throws Exception {
        CreateCustomerBeneficiaryRequest request = new CreateCustomerBeneficiaryRequest();
        request.setAccountId(accountId);
        request.setBeneficiaryName("Jane Doe");
        request.setBankName("Apex Bank");
        request.setAccountNumber("1234567890");

        when(beneficiaryService.createCustomerBeneficiary(any(), anyString()))
                .thenReturn(response);

        mockMvc.perform(post("/api/beneficiaries/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(beneficiaryId.toString()))
                .andExpect(jsonPath("$.beneficiaryName").value("Jane Doe"));
    }

    @Test
    @WithMockUser(username = "customer_user", roles = {"CUSTOMER"})
    @DisplayName("GET /api/beneficiaries/me/{id} returns beneficiary by ID")
    void getCurrentCustomerBeneficiaryById_Success() throws Exception {
        when(beneficiaryService.getCustomerBeneficiaryById(eq(beneficiaryId), anyString()))
                .thenReturn(response);

        mockMvc.perform(get("/api/beneficiaries/me/" + beneficiaryId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(beneficiaryId.toString()))
                .andExpect(jsonPath("$.beneficiaryName").value("Jane Doe"));
    }

    @Test
    @WithMockUser(username = "customer_user", roles = {"CUSTOMER"})
    @DisplayName("GET /api/beneficiaries/me/{id} returns 404 when not owned by customer")
    void getCurrentCustomerBeneficiaryById_NotFound() throws Exception {
        when(beneficiaryService.getCustomerBeneficiaryById(eq(beneficiaryId), anyString()))
                .thenThrow(new BeneficiaryNotFoundException("Beneficiary with ID '" + beneficiaryId + "' not found."));

        mockMvc.perform(get("/api/beneficiaries/me/" + beneficiaryId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    @WithMockUser(username = "customer_user", roles = {"CUSTOMER"})
    @DisplayName("PUT /api/beneficiaries/me/{id} updates customer beneficiary")
    void updateCustomerBeneficiary_Success() throws Exception {
        UpdateBeneficiaryRequest request = new UpdateBeneficiaryRequest();
        request.setBeneficiaryName("Jane Updated");
        request.setBankName("Apex Bank");
        request.setStatus(BeneficiaryStatus.ACTIVE);

        when(beneficiaryService.updateCustomerBeneficiary(eq(beneficiaryId), any(), anyString()))
                .thenReturn(response);

        mockMvc.perform(put("/api/beneficiaries/me/" + beneficiaryId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "customer_user", roles = {"CUSTOMER"})
    @DisplayName("DELETE /api/beneficiaries/me/{id} deletes customer beneficiary")
    void deleteCustomerBeneficiary_Success() throws Exception {
        doNothing().when(beneficiaryService).deleteCustomerBeneficiary(eq(beneficiaryId), anyString());

        mockMvc.perform(delete("/api/beneficiaries/me/" + beneficiaryId))
                .andExpect(status().isNoContent());

        verify(beneficiaryService).deleteCustomerBeneficiary(eq(beneficiaryId), anyString());
    }

    // Bank/Staff endpoints with authority
    @Test
    @WithMockUser(authorities = {"BENEFICIARY_VIEW"})
    @DisplayName("GET /api/beneficiaries/{id} succeeds with BENEFICIARY_VIEW authority")
    void getBeneficiaryById_Staff_Success() throws Exception {
        when(beneficiaryService.getBeneficiaryById(beneficiaryId))
                .thenReturn(response);

        mockMvc.perform(get("/api/beneficiaries/" + beneficiaryId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(beneficiaryId.toString()));
    }

    @Test
    @WithMockUser(authorities = {"BENEFICIARY_VIEW"})
    @DisplayName("GET /api/beneficiaries/customer/{customerId} succeeds with BENEFICIARY_VIEW authority")
    void getBeneficiariesByCustomer_Staff_Success() throws Exception {
        when(beneficiaryService.getBeneficiariesByCustomer(eq(customerId), anyInt(), anyInt()))
                .thenReturn(new PageImpl<>(List.of(response)));

        mockMvc.perform(get("/api/beneficiaries/customer/" + customerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(beneficiaryId.toString()));
    }

    @Test
    @WithMockUser(authorities = {"BENEFICIARY_CREATE"})
    @DisplayName("POST /api/beneficiaries succeeds with BENEFICIARY_CREATE authority")
    void createBeneficiary_Staff_Success() throws Exception {
        CreateBeneficiaryRequest request = new CreateBeneficiaryRequest();
        request.setCustomerId(customerId);
        request.setAccountId(accountId);
        request.setBeneficiaryName("Jane Doe");
        request.setBankName("Apex Bank");
        request.setAccountNumber("1234567890");

        when(beneficiaryService.createBeneficiary(any())).thenReturn(response);

        mockMvc.perform(post("/api/beneficiaries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(beneficiaryId.toString()));
    }

    @Test
    @WithMockUser(authorities = {"BENEFICIARY_UPDATE"})
    @DisplayName("PUT /api/beneficiaries/{id} succeeds with BENEFICIARY_UPDATE authority")
    void updateBeneficiary_Staff_Success() throws Exception {
        UpdateBeneficiaryRequest request = new UpdateBeneficiaryRequest();
        request.setBeneficiaryName("Jane Updated");
        request.setStatus(BeneficiaryStatus.ACTIVE);

        when(beneficiaryService.updateBeneficiary(eq(beneficiaryId), any())).thenReturn(response);

        mockMvc.perform(put("/api/beneficiaries/" + beneficiaryId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = {"BENEFICIARY_DELETE"})
    @DisplayName("DELETE /api/beneficiaries/{id} succeeds with BENEFICIARY_DELETE authority")
    void deleteBeneficiary_Staff_Success() throws Exception {
        doNothing().when(beneficiaryService).deleteBeneficiary(beneficiaryId);

        mockMvc.perform(delete("/api/beneficiaries/" + beneficiaryId))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(username = "customer_user", roles = {"CUSTOMER"})
    @DisplayName("GET /api/beneficiaries/{id} is forbidden for customer without BENEFICIARY_VIEW authority")
    void getBeneficiaryById_ForbiddenForCustomer() throws Exception {
        mockMvc.perform(get("/api/beneficiaries/" + beneficiaryId))
                .andExpect(status().isForbidden());
    }
}

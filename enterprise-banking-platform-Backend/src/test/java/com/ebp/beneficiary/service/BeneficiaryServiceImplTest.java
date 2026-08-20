package com.ebp.beneficiary.service;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.ebp.account.entity.Account;
import com.ebp.account.exception.AccountNotFoundException;
import com.ebp.account.repository.AccountRepository;
import com.ebp.beneficiary.dto.BeneficiaryResponse;
import com.ebp.beneficiary.dto.CreateCustomerBeneficiaryRequest;
import com.ebp.beneficiary.dto.UpdateBeneficiaryRequest;
import com.ebp.beneficiary.entity.Beneficiary;
import com.ebp.beneficiary.entity.BeneficiaryStatus;
import com.ebp.beneficiary.exception.BeneficiaryAlreadyExistsException;
import com.ebp.beneficiary.exception.BeneficiaryNotFoundException;
import com.ebp.beneficiary.mapper.BeneficiaryMapper;
import com.ebp.beneficiary.repository.BeneficiaryRepository;
import com.ebp.customer.entity.Customer;
import com.ebp.customer.exception.CustomerNotFoundException;
import com.ebp.customer.repository.CustomerRepository;
import com.ebp.user.entity.User;
import com.ebp.user.exception.UserNotFoundException;
import com.ebp.user.repository.UserRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BeneficiaryServiceImplTest {

    @Mock
    private BeneficiaryRepository beneficiaryRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private BeneficiaryMapper beneficiaryMapper;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BeneficiaryServiceImpl beneficiaryService;

    private String username;
    private User authUser;
    private Customer customer1;
    private Customer customer2;
    private Account account1;
    private Account account2;
    private Beneficiary beneficiary1;
    private Beneficiary beneficiary2;

    @BeforeEach
    void setUp() {
        username = "customer_user";

        authUser = new User();
        authUser.setId(UUID.randomUUID());
        authUser.setUsername(username);

        customer1 = new Customer();
        customer1.setId(UUID.randomUUID());
        customer1.setUser(authUser);
        customer1.setCustomerNumber("CUST-001");

        customer2 = new Customer();
        customer2.setId(UUID.randomUUID());
        customer2.setCustomerNumber("CUST-002");

        account1 = new Account();
        account1.setId(UUID.randomUUID());
        account1.setCustomer(customer1);
        account1.setAccountNumber("ACC-1001");

        account2 = new Account();
        account2.setId(UUID.randomUUID());
        account2.setCustomer(customer2);
        account2.setAccountNumber("ACC-2001");

        beneficiary1 = new Beneficiary();
        beneficiary1.setId(UUID.randomUUID());
        beneficiary1.setCustomer(customer1);
        beneficiary1.setAccount(account1);
        beneficiary1.setBeneficiaryName("Jane Doe");
        beneficiary1.setBankName("Apex Bank");
        beneficiary1.setAccountNumber("BEN-1111");
        beneficiary1.setStatus(BeneficiaryStatus.ACTIVE);
        beneficiary1.setCreatedAt(OffsetDateTime.now());
        beneficiary1.setUpdatedAt(OffsetDateTime.now());

        beneficiary2 = new Beneficiary();
        beneficiary2.setId(UUID.randomUUID());
        beneficiary2.setCustomer(customer2);
        beneficiary2.setAccount(account2);
        beneficiary2.setBeneficiaryName("Mark Smith");
        beneficiary2.setBankName("Global Bank");
        beneficiary2.setAccountNumber("BEN-2222");
        beneficiary2.setStatus(BeneficiaryStatus.ACTIVE);
        beneficiary2.setCreatedAt(OffsetDateTime.now());
        beneficiary2.setUpdatedAt(OffsetDateTime.now());
    }

    private void mockAuthCustomer() {
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(authUser));
        when(customerRepository.findByUser(authUser)).thenReturn(Optional.of(customer1));
    }

    // 1. Customer can list own beneficiaries
    @Test
    @DisplayName("Customer can list own beneficiaries")
    void customerCanListOwnBeneficiaries() {
        mockAuthCustomer();

        Pageable pageable = PageRequest.of(0, 10, Sort.by("createdAt").descending());
        Page<Beneficiary> beneficiaryPage = new PageImpl<>(List.of(beneficiary1));

        when(beneficiaryRepository.findByCustomerId(customer1.getId(), pageable))
                .thenReturn(beneficiaryPage);

        BeneficiaryResponse response = new BeneficiaryResponse();
        response.setId(beneficiary1.getId());
        response.setCustomerId(customer1.getId());
        response.setBeneficiaryName("Jane Doe");

        when(beneficiaryMapper.toResponse(beneficiary1)).thenReturn(response);

        Page<BeneficiaryResponse> result =
                beneficiaryService.getCurrentCustomerBeneficiaries(0, 10, username);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getCustomerId()).isEqualTo(customer1.getId());
        verify(beneficiaryRepository).findByCustomerId(customer1.getId(), pageable);
    }

    // 2. Customer cannot list another customer's beneficiaries
    @Test
    @DisplayName("Customer query is strictly scoped to authenticated customer and does not query another customer")
    void customerCannotListAnotherCustomerBeneficiaries() {
        mockAuthCustomer();

        Pageable pageable = PageRequest.of(0, 10, Sort.by("createdAt").descending());
        when(beneficiaryRepository.findByCustomerId(customer1.getId(), pageable))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

        Page<BeneficiaryResponse> result =
                beneficiaryService.getCurrentCustomerBeneficiaries(0, 10, username);

        assertThat(result.getContent()).isEmpty();
        verify(beneficiaryRepository, never()).findByCustomerId(eq(customer2.getId()), any());
    }

    // 3. Customer can create beneficiary using own account
    @Test
    @DisplayName("Customer can create beneficiary using own account")
    void customerCanCreateBeneficiaryUsingOwnAccount() {
        mockAuthCustomer();

        CreateCustomerBeneficiaryRequest request = new CreateCustomerBeneficiaryRequest();
        request.setAccountId(account1.getId());
        request.setBeneficiaryName("Jane Doe");
        request.setBankName("Apex Bank");
        request.setAccountNumber("BEN-1111");

        when(accountRepository.findById(account1.getId())).thenReturn(Optional.of(account1));
        when(beneficiaryRepository.existsByCustomerIdAndAccountId(customer1.getId(), account1.getId()))
                .thenReturn(false);

        Beneficiary entityToSave = new Beneficiary();
        entityToSave.setBeneficiaryName("Jane Doe");
        when(beneficiaryMapper.toEntity(request)).thenReturn(entityToSave);
        when(beneficiaryRepository.save(any(Beneficiary.class))).thenReturn(beneficiary1);

        BeneficiaryResponse response = new BeneficiaryResponse();
        response.setId(beneficiary1.getId());
        response.setCustomerId(customer1.getId());
        when(beneficiaryMapper.toResponse(beneficiary1)).thenReturn(response);

        BeneficiaryResponse result =
                beneficiaryService.createCustomerBeneficiary(request, username);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(beneficiary1.getId());
        verify(beneficiaryRepository).save(any(Beneficiary.class));
    }

    // 4. Customer cannot create beneficiary using another customer's account
    @Test
    @DisplayName("Customer cannot create beneficiary using another customer's account")
    void customerCannotCreateBeneficiaryUsingAnotherCustomerAccount() {
        mockAuthCustomer();

        CreateCustomerBeneficiaryRequest request = new CreateCustomerBeneficiaryRequest();
        request.setAccountId(account2.getId()); // belongs to customer2
        request.setBeneficiaryName("Jane Doe");
        request.setBankName("Apex Bank");
        request.setAccountNumber("BEN-1111");

        when(accountRepository.findById(account2.getId())).thenReturn(Optional.of(account2));

        assertThatThrownBy(() ->
                beneficiaryService.createCustomerBeneficiary(request, username))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Account does not belong to the authenticated customer.");

        verify(beneficiaryRepository, never()).save(any());
    }

    // 5. Account not found during creation
    @Test
    @DisplayName("Creation fails when requested account is not found")
    void customerCannotCreateBeneficiary_AccountNotFound() {
        mockAuthCustomer();

        UUID nonExistentAccountId = UUID.randomUUID();
        CreateCustomerBeneficiaryRequest request = new CreateCustomerBeneficiaryRequest();
        request.setAccountId(nonExistentAccountId);
        request.setBeneficiaryName("Jane Doe");
        request.setAccountNumber("BEN-1111");

        when(accountRepository.findById(nonExistentAccountId)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                beneficiaryService.createCustomerBeneficiary(request, username))
                .isInstanceOf(AccountNotFoundException.class)
                .hasMessageContaining(nonExistentAccountId.toString());

        verify(beneficiaryRepository, never()).save(any());
    }

    // 6. Duplicate beneficiary validation still works
    @Test
    @DisplayName("Duplicate beneficiary validation still works and rejects creation")
    void duplicateBeneficiaryValidationStillWorks() {
        mockAuthCustomer();

        CreateCustomerBeneficiaryRequest request = new CreateCustomerBeneficiaryRequest();
        request.setAccountId(account1.getId());
        request.setBeneficiaryName("Jane Doe");
        request.setAccountNumber("BEN-1111");

        when(accountRepository.findById(account1.getId())).thenReturn(Optional.of(account1));
        when(beneficiaryRepository.existsByCustomerIdAndAccountId(customer1.getId(), account1.getId()))
                .thenReturn(true);

        assertThatThrownBy(() ->
                beneficiaryService.createCustomerBeneficiary(request, username))
                .isInstanceOf(BeneficiaryAlreadyExistsException.class)
                .hasMessage("Beneficiary already exists for this customer and account.");

        verify(beneficiaryRepository, never()).save(any());
    }

    // 7. Customer can view own beneficiary
    @Test
    @DisplayName("Customer can view own beneficiary")
    void customerCanViewOwnBeneficiary() {
        mockAuthCustomer();

        when(beneficiaryRepository.findById(beneficiary1.getId()))
                .thenReturn(Optional.of(beneficiary1));

        BeneficiaryResponse response = new BeneficiaryResponse();
        response.setId(beneficiary1.getId());
        when(beneficiaryMapper.toResponse(beneficiary1)).thenReturn(response);

        BeneficiaryResponse result =
                beneficiaryService.getCustomerBeneficiaryById(beneficiary1.getId(), username);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(beneficiary1.getId());
    }

    // 8. Customer cannot view another customer's beneficiary (404 NotFound to prevent leakage)
    @Test
    @DisplayName("Customer cannot view another customer's beneficiary")
    void customerCannotViewAnotherCustomerBeneficiary() {
        mockAuthCustomer();

        // beneficiary2 belongs to customer2
        when(beneficiaryRepository.findById(beneficiary2.getId()))
                .thenReturn(Optional.of(beneficiary2));

        assertThatThrownBy(() ->
                beneficiaryService.getCustomerBeneficiaryById(beneficiary2.getId(), username))
                .isInstanceOf(BeneficiaryNotFoundException.class)
                .hasMessageContaining(beneficiary2.getId().toString());
    }

    // 9. Customer can update own beneficiary
    @Test
    @DisplayName("Customer can update own beneficiary")
    void customerCanUpdateOwnBeneficiary() {
        mockAuthCustomer();

        UpdateBeneficiaryRequest updateRequest = new UpdateBeneficiaryRequest();
        updateRequest.setBeneficiaryName("Jane Updated");
        updateRequest.setBankName("Apex Bank North");
        updateRequest.setStatus(BeneficiaryStatus.ACTIVE);

        when(beneficiaryRepository.findById(beneficiary1.getId()))
                .thenReturn(Optional.of(beneficiary1));
        when(beneficiaryRepository.save(beneficiary1)).thenReturn(beneficiary1);

        BeneficiaryResponse response = new BeneficiaryResponse();
        response.setId(beneficiary1.getId());
        response.setBeneficiaryName("Jane Updated");
        when(beneficiaryMapper.toResponse(beneficiary1)).thenReturn(response);

        BeneficiaryResponse result =
                beneficiaryService.updateCustomerBeneficiary(beneficiary1.getId(), updateRequest, username);

        assertThat(result).isNotNull();
        verify(beneficiaryMapper).updateEntity(beneficiary1, updateRequest);
        verify(beneficiaryRepository).save(beneficiary1);
    }

    // 10. Customer cannot update another customer's beneficiary
    @Test
    @DisplayName("Customer cannot update another customer's beneficiary")
    void customerCannotUpdateAnotherCustomerBeneficiary() {
        mockAuthCustomer();

        UpdateBeneficiaryRequest updateRequest = new UpdateBeneficiaryRequest();
        updateRequest.setBeneficiaryName("Hacked Name");
        updateRequest.setStatus(BeneficiaryStatus.ACTIVE);

        // beneficiary2 belongs to customer2
        when(beneficiaryRepository.findById(beneficiary2.getId()))
                .thenReturn(Optional.of(beneficiary2));

        assertThatThrownBy(() ->
                beneficiaryService.updateCustomerBeneficiary(beneficiary2.getId(), updateRequest, username))
                .isInstanceOf(BeneficiaryNotFoundException.class)
                .hasMessageContaining(beneficiary2.getId().toString());

        verify(beneficiaryRepository, never()).save(beneficiary2);
    }

    // 11. Customer can delete own beneficiary
    @Test
    @DisplayName("Customer can delete own beneficiary")
    void customerCanDeleteOwnBeneficiary() {
        mockAuthCustomer();

        when(beneficiaryRepository.findById(beneficiary1.getId()))
                .thenReturn(Optional.of(beneficiary1));

        beneficiaryService.deleteCustomerBeneficiary(beneficiary1.getId(), username);

        verify(beneficiaryRepository).delete(beneficiary1);
    }

    // 12. Customer cannot delete another customer's beneficiary
    @Test
    @DisplayName("Customer cannot delete another customer's beneficiary")
    void customerCannotDeleteAnotherCustomerBeneficiary() {
        mockAuthCustomer();

        // beneficiary2 belongs to customer2
        when(beneficiaryRepository.findById(beneficiary2.getId()))
                .thenReturn(Optional.of(beneficiary2));

        assertThatThrownBy(() ->
                beneficiaryService.deleteCustomerBeneficiary(beneficiary2.getId(), username))
                .isInstanceOf(BeneficiaryNotFoundException.class)
                .hasMessageContaining(beneficiary2.getId().toString());

        verify(beneficiaryRepository, never()).delete(beneficiary2);
    }

    // 13. User not found
    @Test
    @DisplayName("Throws UserNotFoundException if authenticated user record does not exist")
    void userNotFoundThrowsException() {
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                beneficiaryService.getCurrentCustomerBeneficiaries(0, 10, username))
                .isInstanceOf(UserNotFoundException.class);
    }

    // 14. Customer profile not found
    @Test
    @DisplayName("Throws CustomerNotFoundException if customer profile for user does not exist")
    void customerProfileNotFoundThrowsException() {
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(authUser));
        when(customerRepository.findByUser(authUser)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                beneficiaryService.getCurrentCustomerBeneficiaries(0, 10, username))
                .isInstanceOf(CustomerNotFoundException.class);
    }
}

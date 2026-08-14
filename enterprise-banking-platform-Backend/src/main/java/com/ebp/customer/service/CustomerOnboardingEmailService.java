package com.ebp.customer.service;

import com.ebp.customer.entity.Customer;

public interface CustomerOnboardingEmailService {

    void sendCredentials(
            Customer customer,
            String username,
            String temporaryPassword);
}

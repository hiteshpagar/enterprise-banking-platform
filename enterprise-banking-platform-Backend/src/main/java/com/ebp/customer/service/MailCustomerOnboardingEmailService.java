package com.ebp.customer.service;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.ebp.customer.entity.Customer;
import com.ebp.customer.exception.CustomerOnboardingEmailException;

@Service
public class MailCustomerOnboardingEmailService
        implements CustomerOnboardingEmailService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final String frontendUrl;

    public MailCustomerOnboardingEmailService(
            ObjectProvider<JavaMailSender> mailSenderProvider,
            @Value("${app.frontend-url}") String frontendUrl) {

        this.mailSenderProvider = mailSenderProvider;
        this.frontendUrl = frontendUrl;
    }

    @Override
    public void sendCredentials(
            Customer customer,
            String username,
            String temporaryPassword) {

        JavaMailSender mailSender =
                mailSenderProvider.getIfAvailable();

        if (mailSender == null) {
            throw new CustomerOnboardingEmailException(
                    "Customer was created, but onboarding email could not be sent because mail is not configured.",
                    null);
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(customer.getEmail());
        message.setSubject("Welcome to Enterprise Banking Platform");
        message.setText(buildBody(customer, username, temporaryPassword));

        try {
            mailSender.send(message);
        } catch (MailException ex) {
            throw new CustomerOnboardingEmailException(
                    "Customer was created, but onboarding email could not be sent.",
                    ex);
        }
    }

    private String buildBody(
            Customer customer,
            String username,
            String temporaryPassword) {

        return "Dear " + customer.getFirstName() + " "
                + customer.getLastName() + ",\n\n"
                + "Your Enterprise Banking Platform account has been created.\n\n"
                + "Login ID:\n"
                + username + "\n\n"
                + "Temporary Password:\n"
                + temporaryPassword + "\n\n"
                + "Please log in and change your temporary password immediately.\n\n"
                + "Login:\n"
                + frontendUrl + "\n\n"
                + "If you did not expect this email, contact your bank immediately.";
    }
}

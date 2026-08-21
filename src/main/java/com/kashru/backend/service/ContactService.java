package com.kashru.backend.service;

import com.kashru.backend.entity.Contact;
import com.kashru.backend.repository.ContactRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContactService {

    private final ContactRepository contactRepository;

    public ContactService(ContactRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    // Create contact
    public Contact saveContact(Contact contact) {
        return contactRepository.save(contact);
    }

    // Get all contacts
    public List<Contact> getAllContacts() {
        return contactRepository.findAll();
    }

    // Get contact by ID
    public Contact getContactById(Long id) {
        return contactRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Contact not found with id: " + id));
    }

    // Delete contact
    public void deleteContact(Long id) {

        if (!contactRepository.existsById(id)) {
            throw new RuntimeException(
                    "Contact not found with id: " + id
            );
        }

        contactRepository.deleteById(id);
    }
}
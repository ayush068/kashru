package com.kashru.backend.controller;

import com.kashru.backend.entity.Contact;
import com.kashru.backend.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    // CREATE CONTACT
    @PostMapping
    public ResponseEntity<Contact> createContact(
            @Valid @RequestBody Contact contact) {

        Contact savedContact = contactService.saveContact(contact);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedContact);
    }

    // GET ALL CONTACTS
    @GetMapping
    public ResponseEntity<List<Contact>> getAllContacts() {

        return ResponseEntity.ok(
                contactService.getAllContacts()
        );
    }

    // GET CONTACT BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Contact> getContactById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                contactService.getContactById(id)
        );
    }

    // DELETE CONTACT
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteContact(
            @PathVariable Long id) {

        contactService.deleteContact(id);

        return ResponseEntity.ok(
                "Contact deleted successfully"
        );
    }
}
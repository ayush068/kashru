package com.kashru.backend.service;

import com.kashru.backend.entity.Product;
import com.kashru.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getActiveProducts() {
        return productRepository.findByActiveTrue();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));
    }

    public Product updateProduct(Long id, Product updatedProduct) {

        Product product = getProductById(id);

        product.setName(updatedProduct.getName());
        product.setPrice(updatedProduct.getPrice());
        product.setDescription(updatedProduct.getDescription());
        product.setCategory(updatedProduct.getCategory());
        product.setImageUrl(updatedProduct.getImageUrl());
        product.setStock(updatedProduct.getStock());
        product.setActive(updatedProduct.getActive());

        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}
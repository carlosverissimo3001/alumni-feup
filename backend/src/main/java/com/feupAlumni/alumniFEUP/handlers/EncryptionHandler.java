package com.feupAlumni.alumniFEUP.handlers;

import javax.crypto.spec.SecretKeySpec;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;

import java.security.NoSuchAlgorithmException;
import java.util.Base64;

public class EncryptionHandler {

    // Generate Symmetric Key
    public static String generateSymmetricKey() throws NoSuchAlgorithmException {
        // Generates the Symmetric Key
        KeyGenerator keyGen = KeyGenerator.getInstance("AES"); // Generates AES Key
        keyGen.init(256); // for AES-256
        SecretKey symmetricKey = keyGen.generateKey();

        // Encode the key as a base64 string
        String encodedKey = Base64.getEncoder().encodeToString(symmetricKey.getEncoded());
        return encodedKey;
    }

    // Encrypts a given value 
    public static String encrypt(String value, String key) throws Exception {
        String symmetricEncryptionAlgorithm = JsonFileHandler.getPropertyFromApplicationProperties("encryption.algorithm").trim();

        SecretKeySpec secretKey = new SecretKeySpec(Base64.getDecoder().decode(key), symmetricEncryptionAlgorithm);
        Cipher cipher = Cipher.getInstance(symmetricEncryptionAlgorithm);
        cipher.init(Cipher.ENCRYPT_MODE, secretKey);
        byte[] encryptedValue = cipher.doFinal(value.getBytes());
        return Base64.getEncoder().encodeToString(encryptedValue);
    }

    // decrypts a given value
    public static String decrypt(String value, String key) throws Exception {
        String symmetricEncryptionAlgorithm = JsonFileHandler.getPropertyFromApplicationProperties("encryption.algorithm").trim();

        SecretKeySpec secretKey = new SecretKeySpec(Base64.getDecoder().decode(key), symmetricEncryptionAlgorithm);
        Cipher cipher = Cipher.getInstance(symmetricEncryptionAlgorithm);
        cipher.init(Cipher.DECRYPT_MODE, secretKey);
        byte[] decodedValue = Base64.getDecoder().decode(value);
        byte[] decryptedValue = cipher.doFinal(decodedValue);
        return new String(decryptedValue);
    }

}

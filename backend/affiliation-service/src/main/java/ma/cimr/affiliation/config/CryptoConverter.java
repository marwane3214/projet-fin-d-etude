package ma.cimr.affiliation.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Component
@Converter
public class CryptoConverter implements AttributeConverter<String, String> {

    @org.springframework.beans.factory.annotation.Value("${application.config.crypto-key:MySuperSecretKey}")
    private String secretKey;

    private static final String ALGORITHM = "AES";

    private SecretKeySpec keySpec() {
        byte[] keyBytes = secretKey.getBytes();
        // AES key must be 16, 24, or 32 bytes (128, 192, or 256 bits)
        byte[] finalKey = new byte[16];
        System.arraycopy(keyBytes, 0, finalKey, 0, Math.min(keyBytes.length, 16));
        return new SecretKeySpec(finalKey, ALGORITHM);
    }

    @Override
    public String convertToDatabaseColumn(String ccNumber) {
        if (ccNumber == null || ccNumber.isEmpty()) return ccNumber;
        try {
            Cipher c = Cipher.getInstance(ALGORITHM);
            c.init(Cipher.ENCRYPT_MODE, keySpec());
            return Base64.getEncoder().encodeToString(c.doFinal(ccNumber.getBytes()));
        } catch (Exception e) {
            // Log it but don't break everything during dev
            System.err.println("Encryption failed: " + e.getMessage());
            return ccNumber;
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) return dbData;
        try {
            // Check if it's likely Base64 encoded
            byte[] decoded = Base64.getDecoder().decode(dbData);
            Cipher c = Cipher.getInstance(ALGORITHM);
            c.init(Cipher.DECRYPT_MODE, keySpec());
            return new String(c.doFinal(decoded));
        } catch (Exception e) {
            // Fallback to plain text if it's not encrypted (e.g., existing data)
            return dbData;
        }
    }
}

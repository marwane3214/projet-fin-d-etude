import base64
from Crypto.Cipher import AES

def encrypt_java_aes(text):
    key = "MySuperSecretKey".encode('utf-8')[:16]
    cipher = AES.new(key, AES.MODE_ECB)
    
    # PKCS5 Padding
    padding_len = 16 - (len(text) % 16)
    padded_text = text + chr(padding_len) * padding_len
    
    encrypted = cipher.encrypt(padded_text.encode('utf-8'))
    return base64.b64encode(encrypted).decode('utf-8')

print(encrypt_java_aes("BW32472"))

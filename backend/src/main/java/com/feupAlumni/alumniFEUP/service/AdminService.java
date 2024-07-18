package com.feupAlumni.alumniFEUP.service;

public interface AdminService {

    // Verify hashed password
    public Boolean verifyPassword(String password);

    // Changes admin password
    public Boolean changeAdminPass(String password);

    // Updates API Key
    public Boolean updateAPIKey(String apiKey) throws Exception;

    // Returns the Encrypted API Key of the Admin
    public String getEncryptedApiKey();

}

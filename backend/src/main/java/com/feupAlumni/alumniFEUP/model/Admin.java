package com.feupAlumni.alumniFEUP.model;
import java.sql.Timestamp;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

// Data corresponding to Alumnis
@Entity
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id; // Primary key and auto incremented
    private String userName;
    private String passwordHash;
    private Timestamp createdAt;

    public Admin(){

    }

    public Admin(String userName, String passwordHash, Timestamp createdAt) {
        this.userName = userName;
        this.passwordHash = passwordHash;
        this.createdAt = createdAt;
    }

    public String getUserName() {
        return userName;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public void setCreatedAt(Timestamp createdAt){
        this.createdAt = createdAt;
    }
}

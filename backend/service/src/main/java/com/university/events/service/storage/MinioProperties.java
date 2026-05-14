package com.university.events.service.storage;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * MinIO / S3-compatible settings for event poster uploads.
 */
@Data
@Component
@ConfigurationProperties(prefix = "minio")
public class MinioProperties {

    /** When false, uploads are rejected (admins can still paste an absolute image URL on create-event). */
    private boolean enabled = true;

    /** MinIO API endpoint, e.g. {@code http://127.0.0.1:9000} */
    private String endpoint = "http://localhost:9200";

    private String accessKey = "admin";
    private String secretKey = "password123";

    /** Bucket name for event images */
    private String bucket = "event-images";

    /**
     * Public browser URL base for objects (optional).
     * If blank, URLs are built as {@code endpoint/bucket/objectKey} (path-style).
     * Use when MinIO is behind a reverse proxy or uses a different public host than {@code endpoint}.
     */
    private String publicBaseUrl = "";
}

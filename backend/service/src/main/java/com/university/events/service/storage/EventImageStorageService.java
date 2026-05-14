package com.university.events.service.storage;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.SetBucketPolicyArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventImageStorageService {

    private static final long MAX_BYTES = 5 * 1024 * 1024;

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private static final Map<String, String> EXT_BY_TYPE = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp",
            "image/gif", ".gif"
    );

    private final MinioProperties properties;
    private final ObjectProvider<MinioClient> minioClientProvider;

    /**
     * Stores an image in MinIO and returns a URL suitable for {@code Event.imageUrl}.
     */
    public String upload(InputStream inputStream, long size, String contentType, String originalFilename) {
        if (!properties.isEnabled()) {
            throw new IllegalStateException(
                    "MinIO uploads are disabled (minio.enabled=false). Paste a full https image URL or enable MinIO.");
        }
        MinioClient client = minioClientProvider.getIfAvailable();
        if (client == null) {
            throw new IllegalStateException("MinIO client is not available.");
        }
        String normalizedType = normalizeContentType(contentType);
        validateContentType(normalizedType);
        if (size <= 0 || size > MAX_BYTES) {
            throw new IllegalArgumentException("Image must be between 1 byte and 5 MB.");
        }

        String ext = resolveExtension(originalFilename, normalizedType);
        String objectName = "evt/" + UUID.randomUUID() + ext;

        try {
            ensureBucket(client);
            client.putObject(
                    PutObjectArgs.builder()
                            .bucket(properties.getBucket())
                            .object(objectName)
                            .stream(inputStream, size, -1)
                            .contentType(normalizedType != null ? normalizedType : "application/octet-stream")
                            .build());
        } catch (Exception e) {
            log.error("MinIO upload failed for bucket {}", properties.getBucket(), e);
            throw new RuntimeException("Could not store image: " + e.getMessage(), e);
        }

        return buildPublicUrl(objectName);
    }

    private static String normalizeContentType(String contentType) {
        if (contentType == null || contentType.isBlank()) {
            return null;
        }
        String lower = contentType.toLowerCase(Locale.ROOT).trim();
        int semi = lower.indexOf(';');
        return semi > 0 ? lower.substring(0, semi).trim() : lower;
    }

    private static void validateContentType(String contentType) {
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Only JPEG, PNG, WebP and GIF images are allowed.");
        }
    }

    private static String resolveExtension(String originalFilename, String contentType) {
        if (originalFilename != null && originalFilename.contains(".")) {
            String ext = originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase(Locale.ROOT);
            if (ext.length() <= 5 && ext.matches("\\.[a-z0-9]+")) {
                return ext;
            }
        }
        return EXT_BY_TYPE.getOrDefault(contentType, ".img");
    }

    private void ensureBucket(MinioClient client) throws Exception {
        String bucket = properties.getBucket();
        if (!client.bucketExists(BucketExistsArgs.builder().bucket(bucket).build())) {
            client.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
            applyPublicReadPolicy(client);
        }
    }

    private void applyPublicReadPolicy(MinioClient client) {
        try {
            String policy = String.format(
                    "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"AWS\":[\"*\"]},\"Action\":[\"s3:GetObject\"],\"Resource\":[\"arn:aws:s3:::%s/*\"]}]}",
                    properties.getBucket());
            client.setBucketPolicy(
                    SetBucketPolicyArgs.builder()
                            .bucket(properties.getBucket())
                            .config(policy)
                            .build());
        } catch (Exception e) {
            log.warn(
                    "Could not set public-read policy on bucket {} — open the MinIO console and allow anonymous download for this bucket if images do not load: {}",
                    properties.getBucket(),
                    e.getMessage());
        }
    }

    private String buildPublicUrl(String objectName) {
        String base = properties.getPublicBaseUrl();
        if (base != null && !base.isBlank()) {
            return trimTrailingSlash(base) + "/" + objectName;
        }
        return trimTrailingSlash(properties.getEndpoint()) + "/" + properties.getBucket() + "/" + objectName;
    }

    private static String trimTrailingSlash(String s) {
        return s.replaceAll("/+$", "");
    }
}

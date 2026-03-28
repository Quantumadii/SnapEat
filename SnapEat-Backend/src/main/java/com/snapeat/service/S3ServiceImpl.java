package com.snapeat.service;

import java.io.InputStream;
import java.net.URI;
import java.net.URLConnection;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3ServiceImpl implements S3Service {
    
    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Value("${aws.s3.region}")
    private String region;

    @Override
	public String uploadFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        String contentType = file.getContentType();
        String extension = getExtension(file.getOriginalFilename(), contentType);
        String fileName = "uploads/" + UUID.randomUUID() + extension;

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType(contentType != null ? contentType : "image/jpeg")
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));
            return buildS3Url(fileName);
        } catch (Exception e) {
            log.error("S3 multipart upload failed: {}", e.getMessage());
            throw new RuntimeException("Failed to upload file to S3", e);
        }
    }

    private String buildS3Url(String fileName) {
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, fileName);
    }

    private String getExtension(String originalFilename, String contentType) {
        if (originalFilename != null) {
            int index = originalFilename.lastIndexOf('.');
            if (index >= 0 && index < originalFilename.length() - 1) {
                return originalFilename.substring(index);
            }
        }

        if (contentType != null && contentType.contains("png")) {
            return ".png";
        }
        if (contentType != null && (contentType.contains("webp") || contentType.contains("jpg") || contentType.contains("jpeg"))) {
            return ".jpg";
        }
        return ".jpg";
    }
}
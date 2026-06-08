package com.university.events.service.qrcode;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.EnumMap;
import java.util.Map;

@Service
public class QrCodeService {

    private static final String ENTRY_PREFIX = "MU-ENTRY:";

    public String buildEntryPayload(String entryCode) {
        return ENTRY_PREFIX + entryCode;
    }

    public String parseEntryCode(String scanned) {
        if (scanned == null) {
            return null;
        }
        String trimmed = scanned.trim();
        if (trimmed.startsWith(ENTRY_PREFIX)) {
            return trimmed.substring(ENTRY_PREFIX.length()).trim();
        }
        return trimmed;
    }

    public String generateQrImageBase64(String payload) {
        try {
            Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
            hints.put(EncodeHintType.MARGIN, 1);

            BitMatrix matrix = new QRCodeWriter().encode(payload, BarcodeFormat.QR_CODE, 280, 280, hints);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", out);
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Could not generate QR code image");
        }
    }
}

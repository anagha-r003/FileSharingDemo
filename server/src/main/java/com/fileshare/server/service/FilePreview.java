package com.fileshare.server.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@Slf4j
public class FilePreview {

    @Value("${file.upload-dir}")
    private String uploadDir;

    public String generatePreview(String filePath, String fileName, String mimeType) {
        try {
            if (mimeType.startsWith("image/"))
                return saveThumb(ImageIO.read(new File(filePath)));

            if ("application/pdf".equals(mimeType)) {
                try (PDDocument doc = PDDocument.load(new File(filePath))) {
                    return saveThumb(new PDFRenderer(doc).renderImageWithDPI(0, 72));
                }
            }
        } catch (Exception e) {
            log.error("Preview generation failed for {}: {}", fileName, e.getMessage());
        }
        return null;
    }

    private String saveThumb(BufferedImage image) throws Exception {
        if (image == null) return null;

        // Resize to max 400x300 keeping aspect ratio
        double ratio = Math.min(400.0 / image.getWidth(), 300.0 / image.getHeight());
        int w = (int) (image.getWidth()  * ratio);
        int h = (int) (image.getHeight() * ratio);

        BufferedImage thumb = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = thumb.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.drawImage(image, 0, 0, w, h, null);
        g.dispose();

        String name = UUID.randomUUID() + "_thumb.jpg";
        File out = Paths.get(uploadDir, "previews", name).toFile();
        out.getParentFile().mkdirs();
        ImageIO.write(thumb, "jpg", out);

        return "previews/" + name;
    }
}

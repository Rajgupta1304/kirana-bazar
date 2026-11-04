import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import '../api_service.dart';

class AppImage extends StatelessWidget {
  final String imageUrl;
  final double? width;
  final double? height;
  final BoxFit fit;
  final BorderRadius? borderRadius;
  final Widget? placeholder;
  final Widget? errorWidget;

  const AppImage({
    super.key,
    required this.imageUrl,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.borderRadius,
    this.placeholder,
    this.errorWidget,
  });

  @override
  Widget build(BuildContext context) {
    Widget imageWidget = _buildImage(context);
    if (borderRadius != null) {
      imageWidget = ClipRRect(
        borderRadius: borderRadius!,
        child: imageWidget,
      );
    }
    return imageWidget;
  }

  Widget _buildImage(BuildContext context) {
    final trimmed = imageUrl.trim();

    if (trimmed.isEmpty || trimmed == 'null') {
      return _buildError(context);
    }

    // 1. Base64 Data URI: "data:image/...;base64,..." or standalone base64
    if (trimmed.startsWith('data:image/') || _isRawBase64(trimmed)) {
      final bytes = _decodeBase64(trimmed);
      if (bytes != null && bytes.isNotEmpty) {
        return Image.memory(
          bytes,
          width: width,
          height: height,
          fit: fit,
          errorBuilder: (context, error, stackTrace) => _buildError(context),
        );
      }
    }

    // 2. Resolve relative path (e.g. "/uploads/xyz.png" or "uploads/xyz.png")
    String finalUrl = trimmed;
    if (!finalUrl.startsWith('http://') &&
        !finalUrl.startsWith('https://') &&
        !finalUrl.startsWith('blob:') &&
        !finalUrl.startsWith('data:')) {
      final base = ApiService.baseUrl.replaceAll(RegExp(r'/api/?$'), '');
      final cleanPath = finalUrl.startsWith('/') ? finalUrl : '/$finalUrl';
      finalUrl = '$base$cleanPath';
    }

    // 3. Render HTTP / HTTPS / Blob network image
    return Image.network(
      finalUrl,
      width: width,
      height: height,
      fit: fit,
      errorBuilder: (context, error, stackTrace) => _buildError(context),
      loadingBuilder: placeholder != null
          ? (context, child, loadingProgress) {
              if (loadingProgress == null) return child;
              return placeholder!;
            }
          : null,
    );
  }

  bool _isRawBase64(String str) {
    if (str.length > 100 && !str.startsWith('http') && !str.startsWith('/')) {
      if (str.startsWith('/9j/') || // JPEG
          str.startsWith('iVBORw') || // PNG
          str.startsWith('R0lGOD') || // GIF
          str.startsWith('UklGR')) { // WebP
        return true;
      }
    }
    return false;
  }

  Uint8List? _decodeBase64(String input) {
    try {
      String clean = input;
      final commaIndex = clean.indexOf(',');
      if (commaIndex != -1) {
        clean = clean.substring(commaIndex + 1);
      }
      clean = clean.replaceAll(RegExp(r'\s+'), '');
      return base64Decode(clean);
    } catch (e) {
      debugPrint('AppImage base64 decode error: $e');
      return null;
    }
  }

  Widget _buildError(BuildContext context) {
    if (errorWidget != null) return errorWidget!;
    return Container(
      width: width,
      height: height,
      color: Colors.grey.shade100,
      alignment: Alignment.center,
      child: Icon(
        Icons.image_outlined,
        size: (width != null && width! < 60) ? 22 : 36,
        color: Colors.grey.shade400,
      ),
    );
  }
}

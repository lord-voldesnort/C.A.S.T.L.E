(function(root) {
  function getAdvice(file) {
    if (!file) return 'Plain text is protected locally with a fresh IV and authenticated encryption.';
    const name = file.name.toLowerCase();
    if (/\.(zip|rar|7z)$/.test(name)) return 'Archives benefit from a saved integrity hash after transfer.';
    if (/\.(mp4|mov|mkv|avi|mp3|wav)$/.test(name) || file.size > 100 * 1024 * 1024) return 'Large media files can take longer to process. Keep this tab open until completion.';
    if (/\.(png|jpe?g|gif|webp)$/.test(name)) return 'Encryption hides the image contents, but not the fact that an encrypted file exists.';
    if (/\.(pdf|docx?|xlsx?|pptx?)$/.test(name)) return 'Keep an original backup; encryption cannot recover a forgotten secret.';
    return 'The original bytes stay on this device while Castle encrypts them.';
  }
  root.CastleAESAdvisor = { getAdvice };
})(window);

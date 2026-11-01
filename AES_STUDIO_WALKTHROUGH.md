# AES Studio Walkthrough

## Purpose

AES Studio is Castle's local AES-256-GCM workspace. It encrypts and decrypts
text or files inside the browser. No text, passphrases, random keys, hashes,
or file bytes are uploaded by the application.

## User Journey

1. Open **AES Studio** from the Encryption category on the homepage.
2. Use **Learn** for the AES/GCM overview, ECB-versus-GCM visual comparison,
   and the optional round visualizer.
3. Use **Encrypt** to choose a text message or any file.
4. Choose one key mode:
   - **Passphrase**: Castle derives a 256-bit AES key with PBKDF2-SHA-256,
     using a fresh random salt for every operation.
   - **Random Key**: Castle creates a fresh 256-bit random AES key and shows
     it once. This key is the only recovery path.
5. Encrypt locally. Text can be copied; files download as `.castle` payloads.
6. For encrypted files, select **Generate integrity hash** to calculate a
   SHA-256 checksum with the shared Hash Toolkit engine.
7. Open **Decrypt**, then paste a Castle text payload or choose a `.castle`
   file. The payload metadata identifies whether a passphrase or random key is
   required.
8. On successful file decryption, select **Verify this file in Hash Toolkit**.
   Hash Toolkit opens directly on Verify Mode A with the restored in-memory
   file already loaded.

## Encryption Payload Lifecycle

`js/aes/crypto.js` creates a JSON envelope containing:

- `version`: Castle payload format version.
- `algorithm`: `AES-256-GCM`.
- `mode`: `passphrase` or `random`.
- `salt`: fresh PBKDF2 salt for passphrase mode only.
- `iv`: fresh 96-bit AES-GCM IV for every encryption operation.
- `type`, `name`, and `mime`: original content metadata.
- `data`: AES-GCM ciphertext, including its authentication tag.

The envelope is Base64-wrapped for text, and saved directly as JSON for files.
AES-GCM validates the authentication tag during decryption. A changed payload,
incorrect passphrase, or incorrect random key shows the integrity failure
message rather than returning untrusted bytes.

## Integrity Bridge

The bridge reuses `window.CastleHashEngine.hashFile('SHA-256', file)` from
`js/hash/crypto.js`; AES Studio does not implement a second hash engine.

After decrypting a file, `js/aes/decrypt.js` keeps the restored browser `File`
object in memory and calls:

```js
window.openHashToolkitVerify(restoredFile);
```

`js/hash-toolkit.js` opens the Hash Toolkit modal on the Verify tab.
`js/hash/verifier.js` exposes `loadModeAFile(file)`, switches to Mode A, and
loads the same object into the verifier state. The user therefore does not
download and re-upload the restored file, and the handoff makes no network
request.

## Module Map

| File | Responsibility |
| --- | --- |
| `js/aes/crypto.js` | AES-GCM, PBKDF2, envelope parsing, local file reads |
| `js/aes/encrypt.js` | Encrypt tab, source/key modes, result actions |
| `js/aes/decrypt.js` | Decrypt tab, restoration, Hash Toolkit handoff |
| `js/aes/advisor.js` | File-type and size guidance |
| `js/aes/coach.js` | Security-review scoring and recommendations |
| `js/aes/learn.js` | ECB/GCM canvas demo and round visualizer |
| `js/aes/ui.js` | Tab switching and keyboard navigation |
| `js/hash-toolkit.js` | Public `openHashToolkitVerify(file)` bridge API |
| `js/hash/verifier.js` | Verify Mode A file-loading API |
| `js/app.js` | AES Studio modal launch, close, backdrop, and Escape handling |

## Security and UX Notes

- AES Studio uses Web Crypto and never uses a passphrase directly as an AES
  key.
- PBKDF2 uses SHA-256 with 250,000 iterations and a 16-byte random salt.
- AES-GCM uses a new 12-byte random IV for every encryption operation.
- File reads are chunked and yield to the UI while loading.
- Passphrase analysis uses the existing `CastlePassword.Analysis` engine.
- The Encryption Details and Security Review panels are collapsed until opened.
- All tab controls have ARIA roles and arrow-key navigation.

## Verification Performed

The implementation was checked with Node.js syntax validation and a Playwright
Chromium smoke test. The browser test covered:

1. Text encryption and decryption with a passphrase.
2. File encryption and decryption with a passphrase.
3. Opening Hash Toolkit Verify Mode A from the restored decrypted file.
4. Confirming that the restored file name is already present in the verifier.

# AES Studio Plan

## Integrity Bridge Handoff

After AES Studio decrypts a file, its result action should call:

```js
window.openHashToolkitVerify(decryptedFile, decryptedSha256);
```

`decryptedFile` must be the in-memory `File` (or `Blob`) created from the
decryption result, and `decryptedSha256` is its locally computed SHA-256 value.
The Hash Toolkit controller opens its modal on the Verify tab, selects Mode A,
and loads both values directly into the verifier state. No file-input
assignment, download, upload, or network transfer occurs.

The Hash Toolkit exposes this through `window.openHashToolkitVerify(file)` and
`window.CastleHashVerifier.loadModeAFile(file)`. AES Studio owns the visible
"Verify this file in Hash Toolkit" button and invokes the former from its
successful file-decryption result state.

## Implemented Module Layout

`js/aes/crypto.js` owns the AES-256-GCM envelope and PBKDF2 operations.
`encrypt.js`, `decrypt.js`, `advisor.js`, `coach.js`, `learn.js`, and `ui.js`
own their respective tab workflows. `js/app.js` opens and closes the modal;
the homepage has one AES Studio entry point.

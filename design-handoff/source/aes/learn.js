/* AES Studio Learn: educational AES internals only. It does not call encryption code. */
(function(root) {
  // AES S-box from FIPS 197, Appendix A. Used only by this educational visualizer.
  const SBOX = [99,124,119,123,242,107,111,197,48,1,103,43,254,215,171,118,202,130,201,125,250,89,71,240,173,212,162,175,156,164,114,192,183,253,147,38,54,63,247,204,52,165,229,241,113,216,49,21,4,199,35,195,24,150,5,154,7,18,128,226,235,39,178,117,9,131,44,26,27,110,90,160,82,59,214,179,41,227,47,132,83,209,0,237,32,252,177,91,106,203,190,57,74,76,88,207,208,239,170,251,67,77,51,133,69,249,2,127,80,60,159,168,81,163,64,143,146,157,56,245,188,182,218,33,16,255,243,210,205,12,19,236,95,151,68,23,196,167,126,61,100,93,25,115,96,129,79,220,34,42,144,136,70,238,184,20,222,94,11,219,224,50,58,10,73,6,36,92,194,194,98,145,149,228,121,231,200,55,109,141,213,78,169,108,86,244,234,101,122,174,8,186,120,37,46,28,166,180,198,232,221,116,31,75,189,139,138,112,62,181,102,72,3,246,14,97,53,87,185,134,193,29,158,225,248,152,17,105,217,142,148,155,30,135,233,206,85,40,223,140,161,137,13,191,230,66,104,65,153,45,15,176,84,187,22];
  const RCON = [0,1,2,4,8,16,32,64,128,27,54];
  let round = 0, step = 0, rounds = [], inputBytes = [], initialized = false;

  const topics = {
    hash: ['Encryption vs Hashing', 'Encryption is like a locked box: the correct key opens it again. Hashing is a fingerprint: it is designed to make recovering the original input impractical.', 'Encryption: Input + key -> ciphertext -> key -> original. Hashing: input -> fixed-looking hash, with no normal decryption step.', 'Use encryption when information must be recovered; use Hash Toolkit hashes to check whether data changed.'],
    gcm: ['Why AES-256-GCM?', 'AES is Advanced Encryption Standard. 256 means a 256-bit secret key. GCM is Galois/Counter Mode.', 'AES has 128-bit blocks and AES-256 has a large keyspace. GCM provides confidentiality plus authentication: ciphertext hides data without the key, while the tag detects modification.', 'Ciphertext is the locked message; the authentication tag is its tamper seal.'],
    values: ['Keys, Salt, and IV / Nonce', 'Key = secret that opens the lock. Salt = 16 random bytes mixed with a passphrase by PBKDF2. IV/nonce = 12 fresh bytes used by GCM.', 'Password + salt -> PBKDF2 -> derived key. The salt may be stored with the package; the password/key must remain secret. Reusing a GCM nonce with one key is dangerous.', 'Same text and key with different nonces produces different ciphertext.'],
    symmetric: ['Symmetric Encryption', 'AES uses the same secret for encryption and decryption, like two people holding copies of one box key.', 'Symmetric encryption is efficient for files. Asymmetric encryption instead uses a public/private key pair and is commonly used to exchange symmetric secrets.', 'Protect and share the AES secret separately from the encrypted file.']
  };

  function init() {
    if (initialized) return;
    initialized = true;
    renderLearn();
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && document.getElementById('aes-learn-overlay')) {
        e.preventDefault();
        e.stopImmediatePropagation();
        closeTopic();
      }
    }, true);
  }

  function renderBottomNav(currentSection) {
    return `
      <div class="flex flex-wrap justify-between items-center mt-md pt-sm border-t border-border/40 text-xs">
        <div class="flex gap-sm items-center">
          <span class="text-text-muted">Explore other sections:</span>
          ${currentSection !== 'what' ? `<button class="learn-goto-what text-primary hover:underline font-code uppercase cursor-pointer">What</button>` : ''}
          ${currentSection !== 'what' && currentSection !== 'why' ? `<span class="text-text-muted">|</span>` : ''}
          ${currentSection !== 'why' ? `<button class="learn-goto-why text-primary hover:underline font-code uppercase cursor-pointer">Why</button>` : ''}
          ${(currentSection !== 'why' && currentSection !== 'how') && currentSection !== 'what' ? `<span class="text-text-muted">|</span>` : ''}
          ${currentSection !== 'how' ? `<button class="learn-goto-how text-primary hover:underline font-code uppercase cursor-pointer">How</button>` : ''}
        </div>
        <button class="learn-back-to-top text-text-muted hover:text-primary transition-colors flex items-center gap-1 cursor-pointer">
          <span class="material-symbols-outlined text-[14px]">arrow_upward</span> Back to Top
        </button>
      </div>
    `;
  }

  function renderTopic1() {
    return `
      <section class="armor-plate p-sm rounded border-primary/30 flex flex-col gap-sm">
        <div class="flex items-center gap-xs">
          <span class="material-symbols-outlined text-primary text-[20px]">sync_alt</span>
          <h3 class="text-primary font-headline-sm text-sm uppercase tracking-wider">1. Encryption vs Hashing</h3>
        </div>
        
        <p class="text-xs text-text-secondary leading-relaxed">
          What problem does encryption solve? Sometimes we have sensitive information that we want to store or send to someone else, but we must prevent unauthorized people from reading it.
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-sm my-xs">
          <div class="p-xs bg-bg-main border border-border rounded flex flex-col gap-1">
            <span class="text-[10px] text-text-muted uppercase font-code">Original Message (Plaintext)</span>
            <p class="text-xs font-code text-on-surface font-semibold">"Meet me at 5 PM."</p>
            <span class="text-[10px] text-text-muted">Clear text. Anyone who sees it can understand it.</span>
          </div>
          <div class="p-xs bg-bg-main border border-border rounded flex flex-col gap-1">
            <span class="text-[10px] text-text-muted uppercase font-code">Encrypted Message (Ciphertext)</span>
            <p class="text-xs font-code text-primary break-all font-semibold font-bold">"8fA27b3d9c8112ae0d4b..."</p>
            <span class="text-[10px] text-text-muted">Scrambled result. Unreadable without the correct key.</span>
          </div>
        </div>

        <div class="flex flex-col gap-xs p-xs bg-surface-container-lowest border border-border/40 rounded">
          <h4 class="text-xs text-primary font-semibold">The Reversible Flow of Encryption</h4>
          <div class="flex flex-col gap-1 text-[11px] text-text-secondary leading-relaxed">
            <div class="flex items-center gap-xs">
              <span class="bg-primary/20 text-primary px-1 rounded font-code">Step 1</span>
              <span><strong>Plaintext</strong> (readable input) is combined with an <strong>Encryption Algorithm</strong> and a secret <strong>Key</strong>.</span>
            </div>
            <div class="flex items-center gap-xs">
              <span class="bg-primary/20 text-primary px-1 rounded font-code">Step 2</span>
              <span>The algorithm outputs <strong>Ciphertext</strong> (the scrambled, protected form).</span>
            </div>
            <div class="flex items-center gap-xs">
              <span class="bg-primary/20 text-primary px-1 rounded font-code">Step 3</span>
              <span>To read the original message, the receiver combines the <strong>Ciphertext</strong> with the <strong>Correct Key</strong> using a <strong>Decryption Algorithm</strong> to retrieve the <strong>Plaintext</strong>.</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-sm">
          <div class="p-sm bg-surface-container-lowest border border-border/40 rounded">
            <h4 class="text-xs text-primary font-semibold mb-xs">🔒 The Locked Box Analogy (Encryption)</h4>
            <p class="text-xs text-text-secondary leading-relaxed">
              Imagine putting a written letter inside a sturdy steel lockbox and snapping a padlock shut. 
              Before it is locked, the letter can be read by anyone. Once locked, the box's contents are protected from prying eyes. 
              Only someone holding the <strong>correct key</strong> can open the padlock to retrieve and read the original letter. 
              This process is designed to be <strong>reversible</strong>: you lock it to protect it, and unlock it to retrieve it.
            </p>
          </div>
          <div class="p-sm bg-surface-container-lowest border border-border/40 rounded">
            <h4 class="text-xs text-primary font-semibold mb-xs">☝️ The Fingerprint Analogy (Hashing)</h4>
            <p class="text-xs text-text-secondary leading-relaxed">
              Now, imagine taking a person's fingerprint. The fingerprint represents that person uniquely, but you cannot reconstruct or "regrow" the entire person from just their fingerprint.
              Similarly, in cybersecurity, <strong>hashing</strong> takes an input (like a file or message) and generates a unique, fixed-length digital fingerprint (a hash).
              It is a <strong>one-way process</strong> — it is designed to be irreversible.
            </p>
          </div>
        </div>

        <details class="border border-border/40 rounded p-xs">
          <summary class="text-xs text-primary font-code cursor-pointer outline-none hover:text-primary-light">Deep Dive: How Hashing Works & Why It Isn't Reversible</summary>
          <div class="mt-xs text-xs text-text-secondary flex flex-col gap-sm leading-relaxed p-xs bg-bg-main/50 rounded">
            <p>
              If you run the word <code class="bg-bg-main px-1 py-0.5 rounded text-primary">hello</code> through a SHA-256 hash function, you will always get:
              <br/><code class="bg-bg-main px-1 py-0.5 rounded text-primary break-all select-all font-code">2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824</code>
            </p>
            <p>
              A cryptographic hash is designed so that recovering the original input from the hash is computationally impractical in normal circumstances. 
              Because it is one-way, you cannot decrypt a hash. However, if the original input is predictable (like a short password), an attacker can sometimes guess possible inputs, calculate their hashes, and compare them to find a match.
            </p>
            <p>
              <strong>Note on Password Storage:</strong> While hashing is ideal for checking whether a password is correct without storing the password itself, real systems do not use raw SHA-256. Instead, they use specialized, slow password-hashing/key-derivation algorithms (like PBKDF2 or bcrypt) to defend against brute-force guessing attacks.
            </p>
          </div>
        </details>

        <div class="p-sm bg-bg-main/40 border border-border/30 rounded flex flex-col gap-sm">
          <h4 class="text-xs text-primary font-code uppercase">Side-by-Side Comparison</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-sm">
            <div class="flex flex-col gap-xs">
              <span class="text-xs font-semibold text-primary">Encryption</span>
              <div class="text-[11px] text-text-secondary leading-relaxed flex flex-col gap-1">
                <div>🔄 <strong>Type:</strong> Two-way (Reversible)</div>
                <div>🔑 <strong>Mechanism:</strong> Requires a key to lock and unlock</div>
                <div>🎯 <strong>Primary Purpose:</strong> Confidentiality (protecting data in transit or storage so it can be recovered later)</div>
                <div>📁 <strong>Examples:</strong> Private chats, full-disk encryption, secure HTTPS websites</div>
              </div>
            </div>
            <div class="flex flex-col gap-xs">
              <span class="text-xs font-semibold text-primary">Hashing</span>
              <div class="text-[11px] text-text-secondary leading-relaxed flex flex-col gap-1">
                <div>➡️ <strong>Type:</strong> One-way (Irreversible)</div>
                <div>🧮 <strong>Mechanism:</strong> Mathematical formula, no key needed to generate</div>
                <div>🎯 <strong>Primary Purpose:</strong> Integrity (detecting whether data has changed or verifying matching values)</div>
                <div>📁 <strong>Examples:</strong> File download checksums, secure password storage matching</div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-xs border-l-2 border-primary bg-primary/5 rounded text-xs text-text-secondary leading-relaxed">
          <strong>Final Takeaway:</strong> Encryption protects information by making it unreadable without the correct key and is designed to be reversible. Hashing creates a one-way digital fingerprint that is useful for checking or representing data without normally recovering the original input.
          <div class="text-[11px] text-text-muted mt-xs italic">For a deeper look at hashing specifically, see Castle's Hash Toolkit.</div>
        </div>
      </section>
    `;
  }

  function renderTopic2() {
    return `
      <section class="armor-plate p-sm rounded border-primary/30 flex flex-col gap-sm">
        <div class="flex items-center gap-xs">
          <span class="material-symbols-outlined text-primary text-[20px]">security</span>
          <h3 class="text-primary font-headline-sm text-sm uppercase tracking-wider">2. Why AES-256-GCM?</h3>
        </div>
        
        <p class="text-xs text-text-secondary leading-relaxed">
          Castle's AES Studio uses a specific standard called <strong>AES-256-GCM</strong>. Let's break this technical name into its three core components to understand what it actually means.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-sm my-xs font-code">
          <div class="p-xs bg-bg-main border border-border rounded flex flex-col gap-1 text-center">
            <span class="text-xs text-primary font-bold">AES</span>
            <span class="text-[10px] text-text-secondary">Advanced Encryption Standard</span>
            <span class="text-[9px] text-text-muted">The standardized lock design</span>
          </div>
          <div class="p-xs bg-bg-main border border-border rounded flex flex-col gap-1 text-center">
            <span class="text-xs text-primary font-bold">256</span>
            <span class="text-[10px] text-text-secondary">Key Size (256-bit Key)</span>
            <span class="text-[9px] text-text-muted font-sans font-normal">Size of the secret key</span>
          </div>
          <div class="p-xs bg-bg-main border border-border rounded flex flex-col gap-1 text-center">
            <span class="text-xs text-primary font-bold">GCM</span>
            <span class="text-[10px] text-text-secondary">Galois/Counter Mode</span>
            <span class="text-[9px] text-text-muted font-sans font-normal">The tamper-evident seal</span>
          </div>
        </div>

        <div class="flex flex-col gap-sm">
          <div class="flex flex-col gap-xs">
            <h4 class="text-xs text-primary font-semibold">1. AES (Advanced Encryption Standard)</h4>
            <p class="text-xs text-text-secondary leading-relaxed">
              AES is a symmetric encryption algorithm chosen by the U.S. government to protect classified information. 
              "Symmetric" means the same secret key is used to encrypt and decrypt (more details in the Symmetric Encryption section below). 
              Think of AES as a highly complex, standardized blueprint for how a lock should be manufactured.
            </p>
          </div>

          <div class="flex flex-col gap-xs">
            <h4 class="text-xs text-primary font-semibold">2. The "256" (Key Size vs. Block Size)</h4>
            <p class="text-xs text-text-secondary leading-relaxed">
              The number 256 refers to the length of the secret key in bits (a binary digit, either 0 or 1). AES supports key sizes of 128, 192, and 256 bits.
              A larger key size means there are exponentially more possible key combinations (keyspace). AES-256 is considered computationally secure when implemented correctly and used with proper key management. Its security comes from this immense keyspace, not because the output merely looks scrambled.
            </p>
            
            <div class="p-xs bg-danger/10 border border-danger/20 rounded text-[11px] text-text-secondary">
              ⚠️ <strong>Important distinction:</strong> AES-256 does NOT mean the data is encrypted in 256-bit blocks. AES always processes data in fixed <strong>128-bit blocks</strong> (16 bytes) at a time, regardless of whether you use a 128-bit or 256-bit key.
            </div>
            
            <div class="text-[11px] text-text-muted italic">
              💡 <strong>Connection:</strong> AES-256's larger key also means more transformation rounds are used internally (14 rounds for 256-bit keys versus 10 rounds for 128-bit keys) — see the HOW section for a step-by-step look at what an internal round actually does.
            </div>
          </div>

          <div class="flex flex-col gap-xs">
            <h4 class="text-xs text-primary font-semibold">3. GCM (Galois/Counter Mode)</h4>
            <p class="text-xs text-text-secondary leading-relaxed">
              AES is a block cipher, meaning it can only encrypt a single 128-bit block at a time. To encrypt longer files or messages, we use a <strong>mode of operation</strong>.
              GCM is a modern mode that combines AES encryption with an authentication tag. 
              <br/>• <strong>AES Encryption</strong> provides <em>confidentiality</em> (hiding the content).
              <br/>• <strong>GCM mode</strong> adds <em>authentication & integrity protection</em> (guaranteeing that the ciphertext has not been modified).
            </p>
            
            <div class="p-sm bg-surface-container-lowest border border-border/40 rounded flex flex-col gap-xs">
              <span class="text-xs text-primary font-semibold">🔒 The Tamper-Evident Seal Analogy</span>
              <p class="text-xs text-text-secondary leading-relaxed">
                Imagine putting your message inside a locked box. That protects the message from being read. 
                But what if an attacker intercepting the box cannot open it, but shakes it, drills a hole, or injects some liquid inside to damage or modify it? 
                GCM is like adding a high-security, tamper-evident security seal on the lock. When the box is decrypted, if the seal is broken or has been modified in any way, GCM detects this tampering and refuses to show the decrypted message.
              </p>
            </div>

            <div class="p-xs bg-bg-main/50 rounded text-[11px] text-text-secondary leading-relaxed border border-border/30">
              <strong>What GCM is NOT:</strong> GCM itself is not the encryption algorithm (AES is). And GCM does not make the ciphertext impossible to decrypt — if you have the correct key and IV, you can still decrypt it. It simply ensures that if anyone alters even one bit of the encrypted file, decryption will fail completely instead of producing scrambled garbage.
            </div>
          </div>
        </div>

        <div class="p-xs border-l-2 border-primary bg-primary/5 rounded text-xs text-text-secondary leading-relaxed">
          <strong>Why Castle Uses It:</strong> Castle uses AES-256-GCM because it provides top-tier symmetric security, detects unauthorized modifications, has excellent native browser support via the Web Crypto API, and executes entirely locally inside your browser (meaning your data and password are never sent to a server).
          <div class="text-[11px] text-text-muted mt-xs italic">
            The Encrypt tab uses the real Web Crypto AES-256-GCM implementation. This Learn tab explains what that implementation is doing behind the scenes.
          </div>
        </div>
      </section>
    `;
  }

  function renderTopic3() {
    return `
      <section class="armor-plate p-sm rounded border-primary/30 flex flex-col gap-sm">
        <div class="flex items-center gap-xs">
          <span class="material-symbols-outlined text-primary text-[20px]">key</span>
          <h3 class="text-primary font-headline-sm text-sm uppercase tracking-wider">3. Keys, Salt, and IV / Nonce</h3>
        </div>
        
        <p class="text-xs text-text-secondary leading-relaxed">
          AES-256-GCM requires more than just a secret key to work safely. Beginners often confuse these three values — <strong>Key</strong>, <strong>Salt</strong>, and <strong>IV/Nonce</strong> — because they all look like random strings. However, they serve completely different purposes.
        </p>

        <div class="flex flex-col gap-sm">
          <!-- Key -->
          <div class="flex flex-col gap-xs">
            <h4 class="text-xs text-primary font-semibold flex items-center gap-1">🔑 1. The Key</h4>
            <p class="text-xs text-text-secondary leading-relaxed">
              The key is the actual secret code used by the mathematical formula to lock and unlock the information.
              <br/>• <strong>Analogy:</strong> Just like a physical padlock key, whoever holds the key can open the lock and read the data.
              <br/>• <strong>Protection:</strong> The key must be kept secret. If an attacker gets your key, the encryption is rendered useless.
            </p>
          </div>

          <!-- Password vs Key -->
          <div class="p-sm bg-surface-container-lowest border border-border/40 rounded flex flex-col gap-sm">
            <h4 class="text-xs text-primary font-semibold">Passphrase vs. Cryptographic Key</h4>
            <p class="text-xs text-text-secondary leading-relaxed">
              A human-readable password (like <code class="bg-bg-main px-1 py-0.5 rounded text-primary">MySuperSecret123</code>) is not suitable to be used directly as a 256-bit AES key. Computer algorithms require keys that are exactly 256 binary bits of high-entropy (unpredictable) data. 
              In Castle's <strong>Passphrase Mode</strong>, a key-derivation process turns your password into a cryptographic key.
            </p>
            
            <!-- Flow Diagram -->
            <div class="p-xs bg-bg-main rounded border border-border flex flex-col items-center text-center gap-1 font-code text-[10px]">
              <div class="text-on-surface font-bold font-semibold">Passphrase ("MySuperSecret123")</div>
              <div class="text-text-muted">↓</div>
              <div class="text-primary font-bold font-semibold">Combined with a Random Salt</div>
              <div class="text-text-muted">↓</div>
              <div class="bg-surface-container-lowest px-sm py-1 border border-border rounded font-bold font-semibold">
                PBKDF2-SHA-256 Key Derivation<br/>
                (250,000 mathematical iterations)
              </div>
              <div class="text-text-muted">↓</div>
              <div class="text-primary font-bold font-semibold">256-bit Derived AES Key</div>
              <div class="text-text-muted">↓</div>
              <div class="text-on-surface">AES-256-GCM Encryption</div>
            </div>
            
            <div class="text-[11px] text-text-muted italic mt-xs">
              💡 <strong>Key Difference:</strong> This derivation process only applies to Passphrase mode. Random Key mode skips this entirely — Castle generates a 256-bit key directly using a secure random number generator, with no password or salt involved.
            </div>
          </div>

          <!-- Salt -->
          <div class="flex flex-col gap-xs">
            <h4 class="text-xs text-primary font-semibold flex items-center gap-1">🧂 2. The Salt</h4>
            <p class="text-xs text-text-secondary leading-relaxed">
              Salt is random data mixed with your password before running it through the key derivation algorithm (PBKDF2).
              <br/>• <strong>It is NOT secret:</strong> The salt is stored openly alongside your encrypted data.
              <br/>• <strong>Why it is used:</strong> If two users choose the exact same password, they would normally end up with the exact same derived key. By adding a unique random salt, the resulting key becomes completely different. This protects against attackers who precompute keys for common passwords (known as rainbow tables).
            </p>

            <!-- Salt Diagram -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-sm my-xs text-[11px] font-code">
              <div class="p-xs bg-bg-main border border-border rounded flex flex-col gap-0.5">
                <span class="text-text-muted uppercase text-[9px]">User A (Password: "castle123")</span>
                <span>Password + Salt A (random)</span>
                <span class="text-primary font-bold">→ Derived Key A (Unique)</span>
              </div>
              <div class="p-xs bg-bg-main border border-border rounded flex flex-col gap-0.5">
                <span class="text-text-muted uppercase text-[9px]">User B (Password: "castle123")</span>
                <span>Password + Salt B (different random)</span>
                <span class="text-primary font-bold">→ Derived Key B (Unique & Different)</span>
              </div>
            </div>
          </div>

          <!-- IV / Nonce -->
          <div class="flex flex-col gap-xs">
            <h4 class="text-xs text-primary font-semibold flex items-center gap-1">🔄 3. The IV / Nonce</h4>
            <p class="text-xs text-text-secondary leading-relaxed">
              In GCM, the <strong>Initialization Vector (IV)</strong> acts as a <strong>nonce</strong> (a shorthand for "number used once"). It is a unique, random block of data.
              <br/>• <strong>It is NOT secret:</strong> Like the salt, the nonce is stored publicly with the encrypted package.
              <br/>• <strong>Why it is used:</strong> If you encrypt the exact same message twice with the same key, you would get the exact same ciphertext. An eavesdropper could notice this pattern. Combining the key and message with a fresh, unique nonce ensures that every single encryption result looks completely different, even if the content and key are identical.
              <br/>• <strong>GCM Warning:</strong> Nonce uniqueness is critical for GCM. Reusing a nonce with the same key in GCM mode can leak cryptographic secrets, allowing attackers to recover the plaintext. Castle automatically generates a fresh, unique <strong>12-byte random GCM IV/nonce</strong> for every encryption action.
            </p>
          </div>

          <!-- Simple Memory Trick -->
          <div class="p-sm bg-primary/10 border border-primary/20 rounded flex flex-col gap-xs">
            <span class="text-xs text-primary font-bold">💡 Simple Memory Analogy (Not literal math)</span>
            <div class="text-xs text-text-secondary flex flex-col gap-1 leading-relaxed">
              <div>🔑 <strong>Key:</strong> The actual key that opens the lock. Keep it secret!</div>
              <div>🧂 <strong>Salt:</strong> The seasoning added to your password so it derives a unique, ultra-strong key. Store it openly.</div>
              <div>🔄 <strong>Nonce (IV):</strong> A one-time security seal ensuring that even if you lock the same letter twice, the boxes look completely different. Store it openly.</div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderTopic4() {
    return `
      <section class="armor-plate p-sm rounded border-primary/30 flex flex-col gap-sm">
        <div class="flex items-center gap-xs">
          <span class="material-symbols-outlined text-primary text-[20px]">swap_horiz</span>
          <h3 class="text-primary font-headline-sm text-sm uppercase tracking-wider">4. Symmetric Encryption</h3>
        </div>
        
        <p class="text-xs text-text-secondary leading-relaxed">
          Symmetric encryption is the oldest and most straightforward method of protecting data. 
          The word <strong>"symmetric"</strong> means balanced or matching. In cryptography, it means that the <strong>same single key</strong> is used for both encrypting (locking) and decrypting (unlocking) the information.
        </p>

        <div class="p-xs bg-bg-main rounded border border-border flex flex-col items-center text-center gap-1 font-code text-[11px] my-xs">
          <div class="text-primary font-bold">Matching Secret Key (shared between both sides)</div>
          <div class="flex items-center gap-sm mt-xs">
            <div class="p-xs border border-border rounded bg-surface-container-lowest">Plaintext</div>
            <div class="text-text-muted">➔ ENCRYPT ➔</div>
            <div class="p-xs border border-primary/50 rounded bg-primary/10 font-bold text-primary">Ciphertext</div>
            <div class="text-text-muted">➔ DECRYPT ➔</div>
            <div class="p-xs border border-border rounded bg-surface-container-lowest">Plaintext</div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-sm">
          <div class="p-sm bg-surface-container-lowest border border-border/40 rounded flex flex-col gap-xs">
            <span class="text-xs font-semibold text-primary">🟢 The Advantages</span>
            <ul class="list-disc pl-sm text-xs text-text-secondary flex flex-col gap-1">
              <li><strong>High Speed:</strong> Symmetric algorithms like AES are extremely fast and require minimal processing power.</li>
              <li><strong>Efficient:</strong> Perfect for encrypting large amounts of data, such as entire databases, videos, or files.</li>
            </ul>
          </div>
          <div class="p-sm bg-surface-container-lowest border border-border/40 rounded flex flex-col gap-xs">
            <span class="text-xs font-semibold text-primary">🔴 The Key-Sharing Challenge</span>
            <p class="text-xs text-text-secondary leading-relaxed">
              The main challenge is <strong>key distribution</strong>: How do you safely share the secret key with someone else? If you send the key over the internet via email or chat, and someone intercepts it, they can read all your encrypted messages.
            </p>
          </div>
        </div>

        <details class="border border-border/40 rounded p-xs">
          <summary class="text-xs text-primary font-code cursor-pointer outline-none hover:text-primary-light">What about Asymmetric Encryption?</summary>
          <div class="mt-xs text-xs text-text-secondary flex flex-col gap-sm leading-relaxed p-xs bg-bg-main/50 rounded">
            <p>
              To solve the key-sharing problem, modern systems use <strong>Asymmetric (Public-Key) Cryptography</strong>. 
              This uses a pair of keys: a <strong>Public Key</strong> (which anyone can use to encrypt a message for you) and a matching <strong>Private Key</strong> (which only you own and use to decrypt).
            </p>
            <p>
              In practice, systems use a hybrid approach: they use Asymmetric encryption to securely share a temporary secret key, and then use Symmetric encryption (like AES) to encrypt the actual message data. 
              Castle's AES Studio focuses specifically on the symmetric part: using AES to secure your data locally.
            </p>
          </div>
        </details>
      </section>
    `;
  }

  function renderWorkflowConnection() {
    return `
      <section class="armor-plate p-sm rounded border-primary/30 flex flex-col gap-sm">
        <div class="flex items-center gap-xs">
          <span class="material-symbols-outlined text-primary text-[20px]">account_tree</span>
          <h3 class="text-primary font-headline-sm text-sm uppercase tracking-wider">How It All Fits Together</h3>
        </div>
        
        <p class="text-xs text-text-secondary leading-relaxed">
          Now that you understand the individual building blocks, here is how they connect in Castle's actual encryption workflow:
        </p>

        <div class="p-sm bg-bg-main rounded border border-border flex flex-col items-center text-center gap-2 font-code text-[11px] leading-relaxed my-xs">
          <div class="text-primary font-bold">Your Sensitive Data (Plaintext)</div>
          <div class="text-text-muted">↓</div>
          
          <div class="border border-border/40 p-xs bg-surface-container-lowest rounded w-full max-w-sm">
            <div class="font-bold text-on-surface font-semibold">Choose Security Mode:</div>
            <div class="grid grid-cols-2 gap-xs mt-xs text-[10px]">
              <div class="p-xs bg-bg-main border border-border rounded">
                <strong>Passphrase Mode</strong><br/>
                PBKDF2 + 16-byte Salt<br/>
                ➔ Derived AES Key
              </div>
              <div class="p-xs bg-bg-main border border-border rounded">
                <strong>Random Key Mode</strong><br/>
                Secure Random Number<br/>
                ➔ Direct AES Key
              </div>
            </div>
          </div>
          
          <div class="text-text-muted">↓</div>
          <div class="text-primary font-bold">256-bit AES Key + Unique 12-byte Nonce / IV</div>
          <div class="text-text-muted">↓</div>
          <div class="bg-primary/10 border border-primary/30 px-sm py-1 rounded font-bold font-semibold text-primary">AES-256-GCM Engine</div>
          <div class="text-text-muted">↓</div>
          <div class="text-primary font-bold">Ciphertext + GCM Authentication Tag</div>
          <div class="text-text-muted">↓</div>
          
          <div class="border border-border/40 p-xs bg-surface-container-lowest rounded w-full max-w-sm">
            <strong class="text-on-surface">Encrypted Castle Package</strong><br/>
            <span class="text-[10px] text-text-muted">(Stores: Ciphertext, Nonce, Salt, Tag)</span>
          </div>
        </div>

        <p class="text-xs text-text-secondary leading-relaxed">
          This diagram represents Castle's real encryption workflow. In the next section (<strong>WHY</strong>), you can explore why this specific workflow is safer than older approaches.
        </p>
      </section>
    `;
  }

  function renderWhat() {
    return `
      <div class="flex flex-col gap-md">
        <!-- Topic 1 -->
        ${renderTopic1()}
        <!-- Topic 2 -->
        ${renderTopic2()}
        <!-- Topic 3 -->
        ${renderTopic3()}
        <!-- Topic 4 -->
        ${renderTopic4()}
        <!-- Workflow connection -->
        ${renderWorkflowConnection()}
        <!-- Bottom Nav -->
        ${renderBottomNav('what')}
      </div>
    `;
  }

  function renderWhy() {
    return `
      <section class="armor-plate p-sm rounded border-primary/30 flex flex-col gap-sm">
        <h3 class="text-primary font-code text-sm">Why encryption mode matters</h3>
        <p class="text-xs text-text-secondary">AES is a block cipher. A mode determines how it protects longer data. ECB encrypts blocks but identical blocks can reveal patterns; GCM uses a unique nonce and adds an authentication tag.</p>
        <div class="grid grid-cols-2 gap-sm">
          <canvas id="aes-ecb-canvas" class="w-full border border-border rounded" aria-label="ECB retains a visible pattern"></canvas>
          <canvas id="aes-gcm-canvas" class="w-full border border-border rounded" aria-label="GCM appears as noise"></canvas>
        </div>
        <p class="text-xs text-text-secondary">GCM flow: plaintext -> AES-GCM + nonce -> ciphertext + authentication tag. Decryption verifies tag + key + nonce before returning plaintext.</p>
      </section>
      ${renderBottomNav('why')}
    `;
  }

  function renderHow() {
    return `
      <section class="armor-plate p-sm rounded border-primary/30">
        <h3 class="text-primary font-code text-sm">AES-256-GCM package flow</h3>
        <div id="aes-flow" class="grid md:grid-cols-4 gap-xs text-xs font-code">
          <button data-flow="Password / secret (passphrase mode only)" class="p-xs border border-border rounded">Secret</button>
          <button data-flow="PBKDF2 with a fresh 16-byte salt derives the key. Random Key mode skips this stage." class="p-xs border border-border rounded">Derive key</button>
          <button data-flow="AES-GCM combines the key and a fresh 12-byte nonce." class="p-xs border border-border rounded">Encrypt</button>
          <button data-flow="Package stores salt, nonce, ciphertext, and authentication tag." class="p-xs border border-border rounded">Package</button>
        </div>
        <p id="aes-flow-note" class="text-xs text-text-secondary mt-xs">Select a stage for its explanation.</p>
      </section>
      <details class="armor-plate p-sm rounded" open>
        <summary class="cursor-pointer text-primary font-code text-sm">Advanced: AES-256 internal round visualizer</summary>
        <div class="mt-sm flex flex-col gap-sm">
          <label class="text-xs text-text-secondary">Educational first 16-byte AES state <input id="aes-round-input" value="castle" maxlength="64" class="ml-xs bg-bg-main border border-border rounded px-sm py-xs text-xs font-code"></label>
          <p id="aes-input-note" class="text-xs text-text-secondary"></p>
          <div id="aes-round-indicator" class="text-primary font-code text-sm"></div>
          <div id="aes-round-cards" class="grid grid-cols-3 md:grid-cols-5 gap-xs"></div>
          <div id="aes-round-detail" class="flex flex-col gap-xs"></div>
          <div class="flex gap-sm">
            <button id="aes-round-next" class="text-primary text-xs font-bold uppercase">Next step</button>
            <button id="aes-round-skip" class="text-text-secondary text-xs font-bold uppercase">Next round</button>
          </div>
          <details>
            <summary class="text-xs text-primary cursor-pointer">What is hexadecimal?</summary>
            <p class="text-xs text-text-secondary">A byte can be shown as decimal 99, hexadecimal 0x63, or binary 01100011. AES state grids use hexadecimal.</p>
          </details>
        </div>
      </details>
      ${renderBottomNav('how')}
    `;
  }

  function switchSection(id) {
    const placeholder = document.getElementById('learn-placeholder');
    if (placeholder) placeholder.classList.add('hidden');

    ['what', 'why', 'how'].forEach(s => {
      const panel = document.getElementById(`learn-${s}`),
            tab = document.getElementById(`learn-tab-${s}`);
      if (s === id) {
        panel.classList.remove('hidden');
        tab.setAttribute('aria-selected', 'true');
        tab.tabIndex = 0;
      } else {
        panel.classList.add('hidden');
        tab.setAttribute('aria-selected', 'false');
        tab.tabIndex = -1;
      }
    });
  }

  function renderLearn() {
    const panel = document.getElementById('aes-panel-learn'); if (!panel) return;
    panel.innerHTML = `
      <div class="grid md:grid-cols-3 gap-sm mb-sm" role="tablist">
        <button id="learn-tab-what" role="tab" aria-controls="learn-what" aria-selected="false" tabindex="0" class="armor-plate p-sm rounded text-left hover:border-primary/70 transition-colors cursor-pointer">
          <h3 class="text-primary font-code text-sm">WHAT</h3>
          <p class="text-xs text-text-secondary">What encryption actually is, and the building blocks behind it.</p>
        </button>
        <button id="learn-tab-why" role="tab" aria-controls="learn-why" aria-selected="false" tabindex="-1" class="armor-plate p-sm rounded text-left hover:border-primary/70 transition-colors cursor-pointer">
          <h3 class="text-primary font-code text-sm">WHY</h3>
          <p class="text-xs text-text-secondary">Why the encryption mode you use matters.</p>
        </button>
        <button id="learn-tab-how" role="tab" aria-controls="learn-how" aria-selected="false" tabindex="-1" class="armor-plate p-sm rounded text-left hover:border-primary/70 transition-colors cursor-pointer">
          <h3 class="text-primary font-code text-sm">HOW</h3>
          <p class="text-xs text-text-secondary">How AES actually transforms your data, step by step.</p>
        </button>
      </div>

      <div id="learn-placeholder" class="armor-plate p-md rounded text-center text-xs md:text-sm text-text-secondary border border-dashed border-border/30 mt-sm">
        Choose a section above to begin.
      </div>

      <section id="learn-what" role="tabpanel" aria-labelledby="learn-tab-what" class="hidden">
        ${renderWhat()}
      </section>

      <section id="learn-why" role="tabpanel" aria-labelledby="learn-tab-why" class="hidden">
        ${renderWhy()}
      </section>

      <section id="learn-how" role="tabpanel" aria-labelledby="learn-tab-how" class="hidden">
        ${renderHow()}
      </section>
    `;
    document.getElementById('learn-tab-what').addEventListener('click', () => switchSection('what'));
    document.getElementById('learn-tab-why').addEventListener('click', () => switchSection('why'));
    document.getElementById('learn-tab-how').addEventListener('click', () => switchSection('how'));
    const tablist = panel.querySelector('[role="tablist"]');
    tablist.addEventListener('keydown', e => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const tabs = ['what', 'why', 'how'];
      const current = document.activeElement.id.replace('learn-tab-', '');
      let idx = tabs.indexOf(current);
      if (idx === -1) idx = 0;
      idx = e.key === 'ArrowRight' ? (idx + 1) % tabs.length : (idx - 1 + tabs.length) % tabs.length;
      document.getElementById(`learn-tab-${tabs[idx]}`).focus();
      switchSection(tabs[idx]);
      e.preventDefault();
    });
    panel.querySelectorAll('[data-aes-topic]').forEach(btn => btn.addEventListener('click', () => openTopic(btn.dataset.aesTopic)));
    panel.querySelectorAll('[data-flow]').forEach(btn => btn.addEventListener('click', () => panel.querySelector('#aes-flow-note').textContent = btn.dataset.flow));
    panel.querySelector('#aes-round-input').addEventListener('input', buildRounds);
    panel.querySelector('#aes-round-next').addEventListener('click', () => { const count = rounds[round].steps.length; if (step < count - 1) step++; else selectRound(Math.min(14, round + 1)); renderVisualizer(); });
    panel.querySelector('#aes-round-skip').addEventListener('click', () => selectRound(Math.min(14, round + 1)));

    // Bind bottom navigation buttons
    const bindBottomNav = () => {
      panel.querySelectorAll('.learn-goto-what').forEach(btn => btn.addEventListener('click', () => {
        document.getElementById('learn-tab-what').click();
        document.getElementById('learn-tab-what').focus();
      }));
      panel.querySelectorAll('.learn-goto-why').forEach(btn => btn.addEventListener('click', () => {
        document.getElementById('learn-tab-why').click();
        document.getElementById('learn-tab-why').focus();
      }));
      panel.querySelectorAll('.learn-goto-how').forEach(btn => btn.addEventListener('click', () => {
        document.getElementById('learn-tab-how').click();
        document.getElementById('learn-tab-how').focus();
      }));
      panel.querySelectorAll('.learn-back-to-top').forEach(btn => btn.addEventListener('click', () => {
        document.getElementById('aes-panel-learn').scrollIntoView({ behavior: 'smooth' });
      }));
    };
    bindBottomNav();

    drawModeDemo(); buildRounds();
  }
  function openTopic(id) { const topic = topics[id]; const host = document.getElementById('aes-studio-modal'); host.insertAdjacentHTML('beforeend', `<div id="aes-learn-overlay" class="absolute inset-0 z-20 flex items-center justify-center p-sm"><div data-aes-learn-close class="absolute inset-0 bg-black/80"></div><article class="armor-plate bg-surface border border-primary/50 rounded p-md max-w-xl relative z-10 flex flex-col gap-sm"><button data-aes-learn-close class="self-end text-text-muted hover:text-primary" aria-label="Close lesson"><span class="material-symbols-outlined">close</span></button><h3 class="text-primary font-headline-sm">${topic[0]}</h3><section><b class="text-primary text-xs">What is it?</b><p class="text-xs text-text-secondary">${topic[1]}</p></section><section><b class="text-primary text-xs">Technical view</b><p class="text-xs text-text-secondary">${topic[2]}</p></section><section><b class="text-primary text-xs">What to remember</b><p class="text-xs text-text-secondary">${topic[3]}</p></section></article></div>`); host.querySelectorAll('[data-aes-learn-close]').forEach(el => el.addEventListener('click', closeTopic)); }
  function closeTopic() { const overlay = document.getElementById('aes-learn-overlay'); if (overlay) overlay.remove(); }
  function buildRounds() { const value = document.getElementById('aes-round-input').value, bytes = Array.from(new TextEncoder().encode(value)); inputBytes = bytes.slice(0,16); const note = document.getElementById('aes-input-note'); if (!bytes.length) { rounds=[]; note.textContent='Enter at least one character to see the AES block visualization.'; document.getElementById('aes-round-detail').innerHTML=''; document.getElementById('aes-round-cards').innerHTML=''; return; } while (inputBytes.length < 16) inputBytes.push(0); note.textContent = `${bytes.length > 16 ? 'Only the first 16 UTF-8 bytes are shown. ' : ''}${bytes.length < 16 ? 'Grey cells are zero padding for this educational visualization only; real AES-GCM handles lengths differently.' : 'This input fills one 16-byte educational state.'}`; const keys = expandKey(Array.from({length:32},(_,i)=>i)); let state = inputBytes.slice(); rounds = []; for(let r=0;r<=14;r++){ const before=state.slice(), steps=[]; if(r===0){state=xor(state,keys[0]);steps.push(['Initial AddRoundKey','XORs the state with round key 0.',before,state.slice()]);}else{let b=state.slice();state=sub(state);steps.push(['SubBytes','Each byte is replaced using the AES S-box.',b,state.slice()]);b=state.slice();state=shift(state);steps.push(['ShiftRows','Rows rotate left by 0, 1, 2, and 3 positions.',b,state.slice()]);if(r!==14){b=state.slice();state=mix(state);steps.push(['MixColumns','Each column is mixed in GF(2^8) to spread changes.',b,state.slice()]);}b=state.slice();state=xor(state,keys[r]);steps.push(['AddRoundKey','XOR combines this state with the round key.',b,state.slice()]);}rounds.push({steps});} round=0;step=0;renderVisualizer(); }
  function renderVisualizer(){ if(!rounds.length)return; const data=rounds[round], current=data.steps[step], detail=document.getElementById('aes-round-detail'); document.getElementById('aes-round-indicator').textContent=`AES-256 | Round ${round} / 14`; document.getElementById('aes-round-cards').innerHTML=rounds.map((_,i)=>`<button data-round="${i}" class="p-xs text-xs font-code border rounded ${i===round?'border-primary text-primary bg-primary/10':'border-border text-text-secondary'}">R${i}${i>1&&i<14?' compact':''}</button>`).join(''); document.querySelectorAll('[data-round]').forEach(btn=>btn.addEventListener('click',()=>selectRound(+btn.dataset.round))); detail.innerHTML=`<div class="p-sm border border-border rounded"><b class="text-primary text-xs">${current[0]} ${round===14&&current[0]==='AddRoundKey'?'(final round: no MixColumns)':''}</b><p class="text-xs text-text-secondary">${current[1]}</p><div class="grid grid-cols-4 gap-1 mt-xs">${current[3].map((v,i)=>`<span class="p-1 text-center text-[10px] font-code border ${i>=new TextEncoder().encode(document.getElementById('aes-round-input').value).slice(0,16).length?'border-border/30 text-text-muted':'border-primary/30 text-primary'}">${v.toString(16).padStart(2,'0')}</span>`).join('')}</div><p class="text-[10px] text-text-muted mt-xs">Step ${step+1} / ${data.steps.length}. Previous transformations remain available by selecting their round.</p></div>`; }
  function selectRound(value){round=value;step=0;renderVisualizer();}
  function xor(a,b){return a.map((v,i)=>v^b[i]);} function sub(a){return a.map(v=>SBOX[v]);} function shift(a){const o=a.slice();for(let r=0;r<4;r++)for(let c=0;c<4;c++)o[r+4*c]=a[r+4*((c+r)%4)];return o;} function gm(a,b){let p=0;for(let i=0;i<8;i++){if(b&1)p^=a;const h=a&128;a=(a<<1)&255;if(h)a^=27;b>>=1;}return p;} function mix(a){const o=a.slice();for(let c=0;c<4;c++){let i=4*c,[x,y,z,w]=a.slice(i,i+4);o[i]=gm(x,2)^gm(y,3)^z^w;o[i+1]=x^gm(y,2)^gm(z,3)^w;o[i+2]=x^y^gm(z,2)^gm(w,3);o[i+3]=gm(x,3)^y^z^gm(w,2);}return o;} function expandKey(key){const words=[];for(let i=0;i<8;i++)words[i]=key.slice(i*4,i*4+4);for(let i=8;i<60;i++){let t=words[i-1].slice();if(i%8===0){t=t.slice(1).concat(t[0]).map(v=>SBOX[v]);t[0]^=RCON[i/8];}else if(i%8===4)t=t.map(v=>SBOX[v]);words[i]=words[i-8].map((v,j)=>v^t[j]);}return Array.from({length:15},(_,r)=>words.slice(r*4,r*4+4).flat());}
  function drawModeDemo(){const e=document.getElementById('aes-ecb-canvas'),g=document.getElementById('aes-gcm-canvas');[e,g].forEach(c=>{c.width=160;c.height=90;});let x=e.getContext('2d');x.fillStyle='#181818';x.fillRect(0,0,160,90);x.fillStyle='#ffb84d';x.fillRect(55,16,50,58);x.fillStyle='#181818';x.fillRect(66,28,8,8);x.fillRect(86,28,8,8);let y=g.getContext('2d'),d=y.createImageData(160,90);for(let i=0;i<d.data.length;i+=4){let v=(i*73+19)%256;d.data[i]=v;d.data[i+1]=v>>1;d.data[i+2]=40;d.data[i+3]=255;}y.putImageData(d,0,0);}
  root.CastleAESLearn={init};
})(window);

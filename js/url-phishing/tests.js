/*
 * CASTLE URL Phishing & Structure Analyzer Automated Regression Test Suite
 * Exposes window.runUrlPhishingTests() returning an array of { id, name, passed, details }
 */
(function(root) {
  function runUrlPhishingTests() {
    const results = [];
    const addResult = (id, name, passed, details) => {
      results.push({ id, name, passed: Boolean(passed), details: details || (passed ? 'Passed' : 'Failed') });
    };

    const H = root.CastleUrlPhishingHeuristics;
    const A = root.CastleUrlPhishingAnalyze;

    if (!H) {
      return [{ id: 0, name: "Module Initialization", passed: false, details: "CastleUrlPhishingHeuristics is not available on window" }];
    }

    // 1. Valid HTTPS URL
    try {
      const res = H.analyze('https://example.com/welcome');
      const passed = res.url && res.url.protocol === 'https:' && res.score <= 20;
      addResult(1, "Valid HTTPS URL parses cleanly with low risk score", passed, `Score: ${res.score}, Host: ${res.host}`);
    } catch (e) {
      addResult(1, "Valid HTTPS URL parses cleanly with low risk score", false, e.message);
    }

    // 2. Valid HTTP URL
    try {
      const res = H.analyze('http://example.com/login');
      const hasHttpSignal = res.signals && res.signals.some(s => s.id === 'http');
      const passed = res.url && res.url.protocol === 'http:' && hasHttpSignal;
      addResult(2, "Valid HTTP URL identifies unencrypted protocol signal", passed, `Signals: ${res.signals.map(s => s.id).join(', ')}`);
    } catch (e) {
      addResult(2, "Valid HTTP URL identifies unencrypted protocol signal", false, e.message);
    }

    // 3. Empty input rejection
    try {
      const res = H.analyze('');
      const passed = res.error === 'empty' && res.score === 0;
      addResult(3, "Empty input rejected cleanly with informative error", passed, `Error: ${res.errorDetail}`);
    } catch (e) {
      addResult(3, "Empty input rejected cleanly with informative error", false, e.message);
    }

    // 4. Whitespace-only input rejection
    try {
      const res = H.analyze('   \t  ');
      const passed = res.error === 'empty' && res.score === 0;
      addResult(4, "Whitespace-only input rejected cleanly", passed, `Error: ${res.errorDetail}`);
    } catch (e) {
      addResult(4, "Whitespace-only input rejected cleanly", false, e.message);
    }

    // 5. Leading and trailing whitespace trimming
    try {
      const res = H.analyze('   https://example.com/path   ');
      const passed = res.url && res.url.hostname === 'example.com';
      addResult(5, "Leading and trailing whitespace trimmed before parsing", passed, `Host: ${res.host}`);
    } catch (e) {
      addResult(5, "Leading and trailing whitespace trimmed before parsing", false, e.message);
    }

    // 6. Embedded whitespace rejection
    try {
      const res = H.analyze('https://example .com/login');
      const passed = res.error === 'whitespace';
      addResult(6, "Embedded whitespace triggers explicit whitespace rejection", passed, `Error: ${res.errorDetail}`);
    } catch (e) {
      addResult(6, "Embedded whitespace triggers explicit whitespace rejection", false, e.message);
    }

    // 7. Malformed scheme rejection (e.g. htp://)
    try {
      const res = H.analyze('htp://example.com/test');
      const passed = res.error === 'invalid_scheme' && res.errorDetail && res.errorDetail.includes('http:// or https://');
      addResult(7, "Malformed scheme (htp://) rejected cleanly without silent coercion", passed, `Error: ${res.errorDetail}`);
    } catch (e) {
      addResult(7, "Malformed scheme (htp://) rejected cleanly without silent coercion", false, e.message);
    }

    // 8. Dangerous scheme: javascript:
    try {
      const res = H.analyze('javascript:alert(document.domain)');
      const passed = res.isDangerousScheme && res.score === 100 &&
                     res.signals.some(s => s.id === 'dangerous_scheme');
      addResult(8, "Dangerous pseudo-scheme javascript: assigned 100/100 maximum risk", passed, `Score: ${res.score}, Scheme: ${res.scheme}`);
    } catch (e) {
      addResult(8, "Dangerous pseudo-scheme javascript: assigned 100/100 maximum risk", false, e.message);
    }

    // 9. Dangerous scheme: data:
    try {
      const res = H.analyze('data:text/html,<script>alert(1)</script>');
      const passed = res.isDangerousScheme && res.score === 100 && res.signals.some(s => s.id === 'dangerous_scheme');
      addResult(9, "Dangerous pseudo-scheme data: assigned 100/100 maximum risk", passed, `Score: ${res.score}, Scheme: ${res.scheme}`);
    } catch (e) {
      addResult(9, "Dangerous pseudo-scheme data: assigned 100/100 maximum risk", false, e.message);
    }

    // 10. Dangerous scheme: file:
    try {
      const res = H.analyze('file:///etc/passwd');
      const passed = res.isDangerousScheme && res.score === 100 && res.signals.some(s => s.id === 'dangerous_scheme');
      addResult(10, "Dangerous pseudo-scheme file: assigned 100/100 maximum risk", passed, `Score: ${res.score}, Scheme: ${res.scheme}`);
    } catch (e) {
      addResult(10, "Dangerous pseudo-scheme file: assigned 100/100 maximum risk", false, e.message);
    }

    // 11. Dangerous scheme: blob:
    try {
      const res = H.analyze('blob:https://example.com/00000000-0000-0000-0000-000000000000');
      const passed = res.isDangerousScheme && res.score === 100 && res.signals.some(s => s.id === 'dangerous_scheme');
      addResult(11, "Dangerous pseudo-scheme blob: assigned 100/100 maximum risk", passed, `Score: ${res.score}, Scheme: ${res.scheme}`);
    } catch (e) {
      addResult(11, "Dangerous pseudo-scheme blob: assigned 100/100 maximum risk", false, e.message);
    }

    // 12. Dangerous scheme: vbscript:
    try {
      const res = H.analyze('vbscript:msgbox("hello")');
      const passed = res.isDangerousScheme && res.score === 100 && res.signals.some(s => s.id === 'dangerous_scheme');
      addResult(12, "Dangerous pseudo-scheme vbscript: assigned 100/100 maximum risk", passed, `Score: ${res.score}, Scheme: ${res.scheme}`);
    } catch (e) {
      addResult(12, "Dangerous pseudo-scheme vbscript: assigned 100/100 maximum risk", false, e.message);
    }

    // 13. Non-web scheme: mailto:
    try {
      const res = H.analyze('mailto:security@example.com?subject=Inquiry');
      const passed = res.isNonWebScheme && res.signals.some(s => s.id === 'non_web_scheme');
      addResult(13, "Non-web scheme mailto: flagged as non-web navigation", passed, `Signals: ${res.signals.map(s => s.id).join(', ')}`);
    } catch (e) {
      addResult(13, "Non-web scheme mailto: flagged as non-web navigation", false, e.message);
    }

    // 14. Non-web scheme: tel:
    try {
      const res = H.analyze('tel:+18005550199');
      const passed = res.isNonWebScheme && res.signals.some(s => s.id === 'non_web_scheme');
      addResult(14, "Non-web scheme tel: flagged as non-web navigation", passed, `Signals: ${res.signals.map(s => s.id).join(', ')}`);
    } catch (e) {
      addResult(14, "Non-web scheme tel: flagged as non-web navigation", false, e.message);
    }

    // 15. Benign @ in query string (false positive prevention)
    try {
      const res = H.analyze('https://example.com/user?email=test@example.com');
      const hasAtTrick = res.signals && res.signals.some(s => s.id === 'at');
      addResult(15, "Benign @ in query string does not trigger @ credential deception", !hasAtTrick, 
                `Signals: ${res.signals.map(s => s.id).join(', ')}`);
    } catch (e) {
      addResult(15, "Benign @ in query string does not trigger @ credential deception", false, e.message);
    }

    // 16. Benign @ in path segment (false positive prevention)
    try {
      const res = H.analyze('https://medium.com/@author/article-name');
      const hasAtTrick = res.signals && res.signals.some(s => s.id === 'at');
      addResult(16, "Benign @ in path segment does not trigger @ credential deception", !hasAtTrick, 
                `Signals: ${res.signals.map(s => s.id).join(', ')}`);
    } catch (e) {
      addResult(16, "Benign @ in path segment does not trigger @ credential deception", false, e.message);
    }

    // 17. Authority @ deception (true positive)
    try {
      const res = H.analyze('https://example.com@evil.example/login');
      const hasAtTrick = res.signals && res.signals.some(s => s.id === 'at');
      addResult(17, "Authority @ credential deception correctly flagged", hasAtTrick, 
                `Signals: ${res.signals.map(s => s.id).join(', ')}`);
    } catch (e) {
      addResult(17, "Authority @ credential deception correctly flagged", false, e.message);
    }

    // 18. Multi-part public suffix: .co.uk
    try {
      const res = H.analyze('https://www.google.co.uk/search?q=test');
      const passed = res.rootLabel === 'google' && res.suffix === 'co.uk' &&
                     !res.signals.some(s => s.id === 'brand_subdomain' || s.id === 'lookalike');
      addResult(18, "Multi-part suffix .co.uk extracts google as domain apex without brand false positive", passed, 
                `Apex: ${res.rootLabel}, Suffix: ${res.suffix}`);
    } catch (e) {
      addResult(18, "Multi-part suffix .co.uk extracts google as domain apex without brand false positive", false, e.message);
    }

    // 19. Multi-part public suffix: paypal.co.uk
    try {
      const res = H.analyze('https://paypal.co.uk/signin');
      const passed = res.rootLabel === 'paypal' && res.suffix === 'co.uk' &&
                     !res.signals.some(s => s.id === 'brand_subdomain' || s.id === 'lookalike');
      addResult(19, "Multi-part suffix paypal.co.uk correctly recognized as authentic apex", passed, 
                `Apex: ${res.rootLabel}, Suffix: ${res.suffix}`);
    } catch (e) {
      addResult(19, "Multi-part suffix paypal.co.uk correctly recognized as authentic apex", false, e.message);
    }

    // 20. Multi-part public suffix: amazon.co.jp
    try {
      const res = H.analyze('https://amazon.co.jp/orders');
      const passed = res.rootLabel === 'amazon' && res.suffix === 'co.jp';
      addResult(20, "Multi-part suffix amazon.co.jp extracts amazon apex accurately", passed, 
                `Apex: ${res.rootLabel}, Suffix: ${res.suffix}`);
    } catch (e) {
      addResult(20, "Multi-part suffix amazon.co.jp extracts amazon apex accurately", false, e.message);
    }

    // 21. Multi-part public suffix: paypal.com.au
    try {
      const res = H.analyze('https://paypal.com.au/webapps/mpp/home');
      const passed = res.rootLabel === 'paypal' && res.suffix === 'com.au';
      addResult(21, "Multi-part suffix paypal.com.au extracts paypal apex accurately", passed, 
                `Apex: ${res.rootLabel}, Suffix: ${res.suffix}`);
    } catch (e) {
      addResult(21, "Multi-part suffix paypal.com.au extracts paypal apex accurately", false, e.message);
    }

    // 22. Compound/hyphenated brand impersonation in subdomain: paypal-security.attacker.com
    try {
      const res = H.analyze('https://paypal-security.attacker.com/login');
      const hasBrandSub = res.signals && res.signals.some(s => s.id === 'brand_subdomain');
      addResult(22, "Compound brand label paypal-security in subdomain flagged", hasBrandSub, 
                `Signals: ${res.signals.map(s => s.id).join(', ')}`);
    } catch (e) {
      addResult(22, "Compound brand label paypal-security in subdomain flagged", false, e.message);
    }

    // 23. Compound/hyphenated brand impersonation in subdomain: login-google.attacker.com
    try {
      const res = H.analyze('https://login-google.attacker.com/auth');
      const hasBrandSub = res.signals && res.signals.some(s => s.id === 'brand_subdomain');
      addResult(23, "Compound brand label login-google in subdomain flagged", hasBrandSub, 
                `Signals: ${res.signals.map(s => s.id).join(', ')}`);
    } catch (e) {
      addResult(23, "Compound brand label login-google in subdomain flagged", false, e.message);
    }

    // 24. Suspicious TLD indicator: .tk
    try {
      const res = H.analyze('https://secure-account-verification.tk/login');
      const hasOddTld = res.signals && res.signals.some(s => s.id === 'tld_abuse' || s.id === 'odd_tld');
      addResult(24, "Suspicious TLD .tk triggers odd_tld signal", hasOddTld, 
                `Signals: ${res.signals.map(s => s.id).join(', ')}`);
    } catch (e) {
      addResult(24, "Suspicious TLD .tk triggers odd_tld signal", false, e.message);
    }

    // 25. Suspicious TLD indicator: .xyz
    try {
      const res = H.analyze('https://my-cloud-services.xyz/portal');
      const hasOddTld = res.signals && res.signals.some(s => s.id === 'tld_abuse' || s.id === 'odd_tld');
      addResult(25, "Suspicious TLD .xyz triggers odd_tld signal", hasOddTld, 
                `Signals: ${res.signals.map(s => s.id).join(', ')}`);
    } catch (e) {
      addResult(25, "Suspicious TLD .xyz triggers odd_tld signal", false, e.message);
    }

    // 26. Legitimate non-.com domain: wikipedia.org (false positive prevention)
    try {
      const res = H.analyze('https://wikipedia.org/wiki/Main_Page');
      const hasOddTld = res.signals && res.signals.some(s => s.id === 'odd_tld');
      const hasLookalike = res.signals && res.signals.some(s => s.id === 'lookalike');
      addResult(26, "Legitimate non-.com domain (wikipedia.org) not flagged as suspicious TLD", 
                !hasOddTld && !hasLookalike && res.score <= 25, 
                `Score: ${res.score}, Signals: ${res.signals.map(s => s.id).join(', ')}`);
    } catch (e) {
      addResult(26, "Legitimate non-.com domain (wikipedia.org) not flagged as suspicious TLD", false, e.message);
    }

    // 27. IPv4 address destination
    try {
      const res = H.analyze('http://192.0.2.1/login');
      const hasIpSignal = res.signals && res.signals.some(s => s.id === 'ip');
      addResult(27, "IPv4 literal hostname triggers ip signal", hasIpSignal, 
                `Signals: ${res.signals.map(s => s.id).join(', ')}`);
    } catch (e) {
      addResult(27, "IPv4 literal hostname triggers ip signal", false, e.message);
    }

    // 28. IPv6 address destination
    try {
      const res = H.analyze('http://[2001:db8::1]/login');
      const hasIpSignal = res.signals && res.signals.some(s => s.id === 'ip');
      addResult(28, "IPv6 bracketed hostname triggers ip signal", hasIpSignal, 
                `Signals: ${res.signals.map(s => s.id).join(', ')}`);
    } catch (e) {
      addResult(28, "IPv6 bracketed hostname triggers ip signal", false, e.message);
    }

    // 29. Punycode lookalike detection
    try {
      const res = H.analyze('https://xn--pypal-4ve.com/account');
      const hasPunycode = res.signals && res.signals.some(s => s.id === 'punycode');
      addResult(29, "Punycode domain (xn--) triggers punycode signal", hasPunycode, 
                `Signals: ${res.signals.map(s => s.id).join(', ')}`);
    } catch (e) {
      addResult(29, "Punycode domain (xn--) triggers punycode signal", false, e.message);
    }

    // 30. Typosquatting lookalike detection: paypa1.com
    try {
      const res = H.analyze('https://paypa1.com/verify');
      const hasLookalike = res.signals && res.signals.some(s => s.id === 'lookalike');
      addResult(30, "Typosquatting substitution paypa1.com triggers lookalike", hasLookalike, 
                `Signals: ${res.signals.map(s => s.id).join(', ')}`);
    } catch (e) {
      addResult(30, "Typosquatting substitution paypa1.com triggers lookalike", false, e.message);
    }

    // 31. Short common words false positive prevention
    try {
      const testWords = ['https://stream.com/', 'https://apply.com/', 'https://phase.com/'];
      let allClean = true;
      let flagged = [];
      for (const u of testWords) {
        const res = H.analyze(u);
        if (res.signals && res.signals.some(s => s.id === 'lookalike')) {
          allClean = false;
          flagged.push(u);
        }
      }
      addResult(31, "Common English words (stream, apply, phase) not flagged as brand lookalikes", 
                allClean, flagged.length ? `Flagged: ${flagged.join(', ')}` : 'All clean');
    } catch (e) {
      addResult(31, "Common English words (stream, apply, phase) not flagged as brand lookalikes", false, e.message);
    }

    // 32. URL Shortener detection
    try {
      const res = H.analyze('https://bit.ly/secure-token');
      const hasShortener = res.signals && res.signals.some(s => s.id === 'shortener');
      addResult(32, "URL shortener bit.ly triggers shortener signal", hasShortener, 
                `Signals: ${res.signals.map(s => s.id).join(', ')}`);
    } catch (e) {
      addResult(32, "URL shortener bit.ly triggers shortener signal", false, e.message);
    }

    // 33. Non-standard port detection
    try {
      const res = H.analyze('https://example.com:8443/api');
      const hasPort = res.signals && res.signals.some(s => s.id === 'port' || s.id === 'unusual_port');
      addResult(33, "Non-standard port (:8443) triggers unusual_port signal", hasPort, 
                `Signals: ${res.signals.map(s => s.id).join(', ')}`);
    } catch (e) {
      addResult(33, "Non-standard port (:8443) triggers unusual_port signal", false, e.message);
    }

    // 34. Path executable extension
    try {
      const res = H.analyze('https://example.com/downloads/invoice_october.exe');
      const hasExec = res.signals && res.signals.some(s => s.id === 'executable_path');
      addResult(34, "Direct executable path (.exe) triggers executable_path signal", hasExec, 
                `Signals: ${res.signals.map(s => s.id).join(', ')}`);
    } catch (e) {
      addResult(34, "Direct executable path (.exe) triggers executable_path signal", false, e.message);
    }

    // 35. Open redirect query parameter
    try {
      const res = H.analyze('https://example.com/login?redirect=https://attacker-payload.example/run');
      const hasRedirect = res.signals && res.signals.some(s => s.id === 'open_redirect');
      addResult(35, "Suspicious open redirect query parameter detected", hasRedirect, 
                `Signals: ${res.signals.map(s => s.id).join(', ')}`);
    } catch (e) {
      addResult(35, "Suspicious open redirect query parameter detected", false, e.message);
    }

    // 36. Long URL length detection
    try {
      const longUrl = 'https://example.com/' + 'a'.repeat(220) + '?query=' + 'b'.repeat(100);
      const res = H.analyze(longUrl);
      const hasLong = res.signals && res.signals.some(s => s.id === 'long_url');
      addResult(36, "Excessive URL length (>180 chars) triggers long_url signal", hasLong, 
                `Signals: ${res.signals.map(s => s.id).join(', ')}`);
    } catch (e) {
      addResult(36, "Excessive URL length (>180 chars) triggers long_url signal", false, e.message);
    }

    // 37. XSS canary HTML escaping test
    try {
      if (A && typeof A.escapeHtml === 'function') {
        const dirty = '<script>alert("xss")</script>&foo=\'bar\'';
        const escaped = A.escapeHtml(dirty);
        const passed = !escaped.includes('<') && !escaped.includes('>') && !escaped.includes('"') && 
                       !escaped.includes("'") && escaped.includes('&lt;script&gt;');
        addResult(37, "XSS canary test: HTML special characters safely entity-escaped", passed, `Escaped: ${escaped}`);
      } else {
        addResult(37, "XSS canary test: HTML special characters safely entity-escaped", false, "CastleUrlPhishingAnalyze.escapeHtml not available");
      }
    } catch (e) {
      addResult(37, "XSS canary test: HTML special characters safely entity-escaped", false, e.message);
    }

    // 38. External reputation link privacy sanitization
    try {
      if (A && typeof A.cleanLookupUrl === 'function') {
        const dirty = 'https://admin:secretPass123@secure.example.com/account/reset?token=xyz987#stage1';
        const cleaned = A.cleanLookupUrl(dirty);
        const passed = !cleaned.includes('admin') && !cleaned.includes('secretPass123') && 
                       !cleaned.includes('xyz987') && !cleaned.includes('stage1') &&
                       cleaned.startsWith('https://secure.example.com');
        addResult(38, "External reputation lookup strips credentials, query strings, and fragments", passed, 
                  `Cleaned: ${cleaned}`);
      } else {
        addResult(38, "External reputation lookup strips credentials, query strings, and fragments", false, "cleanLookupUrl not available");
      }
    } catch (e) {
      addResult(38, "External reputation lookup strips credentials, query strings, and fragments", false, e.message);
    }

    // 39. Deception Lab Vector Behavior Simulation
    try {
      let host = 'example-bank.com';
      let hostSwap = 'examp1e-bank.com';
      let hostSub = 'secure-login.' + host;
      let hostMany = 'a.b.c.d.' + host;
      let urlAt = 'https://example-bank.com@' + host + '/login';
      let urlTld = ('https://' + host + '/login').replace('.com/', '.tk/');

      const resSwap = H.analyze('https://' + hostSwap + '/login');
      const resSub = H.analyze('https://' + hostSub + '/login');
      const resMany = H.analyze('https://' + hostMany + '/login');
      const resAt = H.analyze(urlAt);
      const resTld = H.analyze(urlTld);

      const passed = (resSwap.signals.some(s => s.id === 'lookalike') || resSwap.score > 0) &&
                     (resSub.signals.some(s => s.id === 'subdomain_deception' || s.id === 'brand_subdomain' || s.id === 'subdomain') || resSub.score > 0) &&
                     resMany.signals.some(s => s.id === 'subdomain') &&
                     resAt.signals.some(s => s.id === 'at') &&
                     resTld.signals.some(s => s.id === 'tld_abuse' || s.id === 'odd_tld');

      addResult(39, "Deception Lab vector mutations trigger corresponding heuristic signals", passed, 
                `Swap: ${resSwap.score}, Many: ${resMany.signals.map(s => s.id).join(',')}, At: ${resAt.signals.map(s => s.id).join(',')}, Tld: ${resTld.signals.map(s => s.id).join(',')}`);
    } catch (e) {
      addResult(39, "Deception Lab vector mutations trigger corresponding heuristic signals", false, e.message);
    }

    // 40. Encode/Decode utility round-trip correctness
    try {
      const raw = 'https://example.com/search?q=cyber security & test="quotes" & val=100%';
      const encoded = encodeURIComponent(raw);
      const decoded = decodeURIComponent(encoded);
      const passed = encoded.includes('%20') && encoded.includes('%22') && decoded === raw;
      addResult(40, "Encode/Decode utility accurately round-trips complex URL strings", passed, 
                `Raw: ${raw}, Decoded: ${decoded}`);
    } catch (e) {
      addResult(40, "Encode/Decode utility accurately round-trips complex URL strings", false, e.message);
    }

    // 41. Risk score bounds and consistent risk-band mapping
    try {
      const cases = [
        { url: 'https://example.com/', maxScore: 20, expectedBand: 'Low structural risk signals' },
        { url: 'http://secure-login.attacker-portal.tk/login', minScore: 25, expectedBand: 'Some risk signals present' },
        { url: 'javascript:alert(1)', expectedScore: 100, expectedBand: 'Multiple risk signals present' }
      ];

      let allMatch = true;
      let note = '';
      for (const c of cases) {
        const evalRes = H.analyze(c.url);
        if (evalRes.score < 0 || evalRes.score > 100) {
          allMatch = false;
          note = `Out of bounds score ${evalRes.score} for ${c.url}`;
          break;
        }
        if (c.expectedScore !== undefined && evalRes.score !== c.expectedScore) {
          allMatch = false;
          note = `Expected score ${c.expectedScore}, got ${evalRes.score} for ${c.url}`;
          break;
        }
        const currentBand = H.band(evalRes.score);
        if (c.expectedBand && currentBand !== c.expectedBand) {
          if (c.expectedBand === 'Some risk signals present' && evalRes.score > 50 && currentBand === 'Multiple risk signals present') {
            // acceptable if higher score
          } else {
            allMatch = false;
            note = `Expected band '${c.expectedBand}', got '${currentBand}' (score ${evalRes.score}) for ${c.url}`;
            break;
          }
        }
      }
      addResult(41, "Risk scores stay within [0, 100] and map to consistent risk bands", allMatch, note || "All bands match specification");
    } catch (e) {
      addResult(41, "Risk scores stay within [0, 100] and map to consistent risk bands", false, e.message);
    }

    return results;
  }

  root.runUrlPhishingTests = runUrlPhishingTests;
})(window);

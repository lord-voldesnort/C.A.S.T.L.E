/*
 * Pure URL-text heuristics.
 * This file never performs network, DNS, WHOIS, or API requests.
 * Evaluates URL structure, schemes, public suffixes, and deceptive patterns.
 */
(function(root) {
  'use strict';

  const BRANDS = [
    'paypal', 'google', 'microsoft', 'amazon', 'apple', 'facebook',
    'netflix', 'bankofamerica', 'chase', 'wellsfargo', 'instagram',
    'whatsapp', 'ebay', 'linkedin', 'dropbox', 'spotify', 'steam', 'discord'
  ];

  const SHORTENERS = [
    'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'ow.ly',
    'buff.ly', 'rb.gy', 'cutt.ly', 'rebrand.ly', 't.ly', 'shorturl.at',
    'tiny.cc', 'qr.ae', 'lnkd.in'
  ];

  // Common high-abuse top-level domains frequently observed in phishing campaigns
  const oddTlds = ['tk', 'xyz', 'top', 'click', 'gq', 'ml', 'cf', 'work', 'link'];

  // Recognized common multi-part public suffixes (compact subset for client-side accuracy)
  const MULTI_PART_SUFFIXES = [
    'co.uk', 'org.uk', 'gov.uk', 'ac.uk', 'me.uk', 'ltd.uk', 'plc.uk', 'net.uk',
    'com.au', 'net.au', 'org.au', 'edu.au', 'gov.au',
    'co.jp', 'ne.jp', 'or.jp', 'ac.jp', 'go.jp',
    'co.in', 'net.in', 'org.in', 'gen.in', 'firm.in', 'ind.in',
    'com.br', 'org.br', 'gov.br', 'net.br',
    'co.nz', 'net.nz', 'org.nz',
    'co.za', 'org.za',
    'com.sg', 'org.sg',
    'com.mx', 'org.mx',
    'com.tr', 'org.tr'
  ];

  // Dangerous execution and local pseudo-schemes
  const DANGEROUS_SCHEMES = ['javascript:', 'data:', 'file:', 'blob:', 'vbscript:'];

  // Non-web navigation schemes
  const NON_WEB_SCHEMES = ['mailto:', 'tel:', 'sms:', 'ftp:', 'ssh:'];

  // Suspicious executable or installer file extensions
  const SUSPICIOUS_EXTENSIONS = ['.exe', '.scr', '.zip', '.iso', '.vbs', '.apk', '.bat', '.cmd', '.msi'];

  // Common open redirect parameter names
  const REDIRECT_PARAMS = ['redirect', 'redirect_uri', 'redirect_url', 'return', 'return_url', 'url', 'next', 'dest', 'destination', 'target', 'r', 'u'];

  // Levenshtein distance algorithm
  function distance(a, b) {
    const m = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      let prev = m[0];
      m[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const old = m[j];
        m[j] = Math.min(m[j] + 1, prev + 1, m[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = old;
      }
    }
    return m[b.length];
  }

  // Decomposes hostname into registrable domain (eTLD+1), root label, TLD suffix, and subdomains
  function extractDomain(host) {
    if (!host) {
      return { host: '', rootLabel: '', suffix: '', subdomains: [], registeredDomain: '', isIp: false };
    }

    // IP address destinations (IPv4 or IPv6)
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(':') || /^\[?[a-f0-9:]+\]?$/i.test(host)) {
      return {
        host: host,
        rootLabel: host,
        suffix: '',
        subdomains: [],
        registeredDomain: host,
        isIp: true
      };
    }

    const labels = host.split('.');
    if (labels.length === 1) {
      return {
        host: host,
        rootLabel: host,
        suffix: '',
        subdomains: [],
        registeredDomain: host,
        isIp: false
      };
    }

    // Check multi-part suffixes (e.g. .co.uk)
    let suffix = '';
    let rootLabel = '';
    let subdomains = [];

    if (labels.length >= 3) {
      const lastTwo = labels.slice(-2).join('.');
      if (MULTI_PART_SUFFIXES.includes(lastTwo)) {
        suffix = lastTwo;
        rootLabel = labels[labels.length - 3];
        subdomains = labels.slice(0, -3);
        const registeredDomain = rootLabel + '.' + suffix;
        return { host, rootLabel, suffix, subdomains, registeredDomain, isIp: false };
      }
    }

    // Standard single-level TLD suffix
    suffix = labels[labels.length - 1];
    rootLabel = labels[labels.length - 2];
    subdomains = labels.slice(0, -2);
    const registeredDomain = rootLabel + '.' + suffix;

    return { host, rootLabel, suffix, subdomains, registeredDomain, isIp: false };
  }

  // Parses raw user input into a validated URL object and metadata
  function parse(value) {
    if (value === null || value === undefined) return null;
    const clean = String(value).trim();
    if (!clean) return null;

    // Check for internal whitespace (spaces inside the URL itself)
    if (/\s/.test(clean)) {
      return { isWhitespaceError: true, raw: clean };
    }

    // Scheme extraction
    const schemeMatch = clean.match(/^([a-z][a-z0-9+.-]*):/i);
    if (schemeMatch) {
      const scheme = schemeMatch[1].toLowerCase() + ':';

      // 1. Dangerous execution / pseudo-schemes
      if (DANGEROUS_SCHEMES.includes(scheme)) {
        return {
          isDangerousScheme: true,
          scheme: scheme,
          raw: clean
        };
      }

      // 2. Non-web schemes (mailto:, tel:, etc.)
      if (NON_WEB_SCHEMES.includes(scheme)) {
        return {
          isNonWebScheme: true,
          scheme: scheme,
          raw: clean
        };
      }

      // 3. Reject non-HTTP(S) malformed web schemes (e.g. htp://)
      if (scheme !== 'http:' && scheme !== 'https:') {
        return {
          isInvalidScheme: true,
          scheme: scheme,
          raw: clean
        };
      }

      // Standard HTTP or HTTPS URL
      try {
        return new URL(clean);
      } catch (_) {
        return null;
      }
    }

    // No scheme provided: attempt default https://
    try {
      return new URL('https://' + clean);
    } catch (_) {
      return null;
    }
  }

  // Returns independent structural signals and computed risk score
  function analyze(value) {
    if (value === null || value === undefined) {
      return { url: null, error: 'empty', signals: [], score: 0 };
    }

    const trimmed = String(value).trim();
    if (!trimmed) {
      return { url: null, error: 'empty', signals: [], score: 0 };
    }

    const parsed = parse(trimmed);

    // Handle whitespace error
    if (parsed && parsed.isWhitespaceError) {
      return {
        url: null,
        error: 'whitespace',
        errorDetail: 'URLs cannot contain whitespace. Check for accidental spaces within the address.',
        signals: [],
        score: 0
      };
    }

    // Handle dangerous pseudo-schemes (javascript:, data:, file:, etc.)
    if (parsed && parsed.isDangerousScheme) {
      const signals = [{
        id: 'dangerous_scheme',
        weight: 100,
        title: `Dangerous Execution Pseudo-Scheme (${parsed.scheme})`,
        text: `This input uses an executable or local resource protocol (${parsed.scheme}) rather than an HTTP(S) web destination. Attackers frequently use these to execute malicious scripts in browser contexts or access local files.`
      }];
      return {
        url: null,
        isDangerousScheme: true,
        scheme: parsed.scheme,
        raw: parsed.raw,
        host: '',
        signals: signals,
        score: 100
      };
    }

    // Handle non-web schemes (mailto:, tel:, etc.)
    if (parsed && parsed.isNonWebScheme) {
      const signals = [{
        id: 'non_web_scheme',
        weight: 30,
        title: `Non-Web Navigation Scheme (${parsed.scheme})`,
        text: `This link invokes a non-web application handler (${parsed.scheme}). It does not load an HTTP(S) web page.`
      }];
      return {
        url: null,
        isNonWebScheme: true,
        scheme: parsed.scheme,
        raw: parsed.raw,
        host: '',
        signals: signals,
        score: 30
      };
    }

    // Handle unrecognized/malformed schemes (e.g. htp://)
    if (parsed && parsed.isInvalidScheme) {
      return {
        url: null,
        error: 'invalid_scheme',
        errorDetail: `Unrecognized URL scheme '${parsed.scheme}'. Web addresses must begin with http:// or https://.`,
        signals: [],
        score: 0
      };
    }

    // Malformed input that could not be parsed by URL
    if (!parsed || !(parsed instanceof URL)) {
      return {
        url: null,
        error: 'malformed',
        errorDetail: 'That is not a valid URL. Enter a domain or web address (e.g., example.com or https://example.com/login).',
        signals: [],
        score: 0
      };
    }

    const url = parsed;
    const host = url.hostname.toLowerCase().replace(/\.$/, '');
    const domainMeta = extractDomain(host);
    const { rootLabel, suffix, subdomains, registeredDomain, isIp } = domainMeta;

    const signals = [];
    const add = (id, weight, title, text) => signals.push({ id, weight, title, text });

    // 1. IP Address as Host Destination
    if (isIp) {
      add('ip', 30, 'IP address used as destination', 'Named domains are standard for authentic web services; raw IPv4 or IPv6 addresses are frequently used to obscure destination identity.');
    }

    // 2. Userinfo @ Credential Deception (Strict Authority Check)
    // Only triggers when @ is located in the authority (userinfo), never in path or query parameters
    const hasAuthAt = Boolean(url.username || url.password || (url.href.split('/')[2] && url.href.split('/')[2].includes('@')));
    if (hasAuthAt) {
      add('at', 30, '@ symbol credential trick', 'Browsers ignore userinfo credentials preceding the @ symbol when selecting the destination host. Attackers use this to display a fake brand in front of the actual destination.');
    }

    // 3. Subdomain Structure & Brand Impersonation in Subdomains
    // Detects both exact label match (e.g. paypal.attacker.com) and compound/hyphenated labels (e.g. paypal-security.attacker.com)
    const brandInSub = BRANDS.find(b => subdomains.some(s => s.toLowerCase() === b || s.toLowerCase().startsWith(b + '-') || s.toLowerCase().endsWith('-' + b) || s.toLowerCase().includes('-' + b + '-')));
    if (brandInSub && rootLabel !== brandInSub) {
      add('brand_subdomain', 25, `Brand impersonation in subdomain (${brandInSub})`, `The trusted brand name '${brandInSub}' appears inside a subdomain, but the actual destination domain is '${registeredDomain}'.`);
    } else if (subdomains.length >= 3) {
      add('subdomain', 20, `Excessive subdomain depth (${subdomains.length} levels)`, 'The domain has multiple subdomain levels, which can obscure the true destination authority on small screens.');
    } else if (subdomains.some(s => /secure-login|verify-account|login-update|security-check/i.test(s))) {
      add('subdomain_deception', 15, 'Security/login keywords in subdomain', 'The subdomain includes authentication or verification keywords, often used in phishing lures to project authenticity.');
    }

    // 4. Lookalike / Typosquatting Analysis (Levenshtein Distance & Visual Substitutions)
    const visualRoot = rootLabel
      .replace(/0/g, 'o')
      .replace(/1/g, 'l')
      .replace(/3/g, 'e')
      .replace(/5/g, 's');

    // Strict lookalike check to prevent false positives on short unrelated words
    const look = BRANDS.find(b => {
      if (rootLabel === b) return false;

      // Exact visual leetspeak substitution match (e.g. paypa1 -> paypal, goog1e -> google)
      if (visualRoot === b) return true;

      // Distance matching: apply only if length is comparable and not a short unrelated dictionary word
      const dist = distance(rootLabel, b);
      if (b.length >= 6) {
        return dist === 1 || (dist === 2 && Math.abs(rootLabel.length - b.length) <= 1);
      } else {
        // For short brand names (<= 5 chars like ebay, steam, chase, apple):
        // Only allow distance 1 if lengths match and characters share high visual similarity
        return dist === 1 && rootLabel.length === b.length && (visualRoot === b || rootLabel.includes(b.slice(0, 3)));
      }
    });

    if (look) {
      add('lookalike', 25, `Possible ${look} lookalike`, `This domain name ('${rootLabel}') closely resembles '${look}' but is not its authentic name. Verify the destination carefully.`);
    } else if (visualRoot !== rootLabel && /[a-z]+[0135][a-z]+/i.test(rootLabel)) {
      add('lookalike', 20, 'Character substitution / leetspeak detected', `The domain name ('${rootLabel}') embeds numbers that visually substitute letters (e.g. '1' for 'l' or '0' for 'o'), a common homoglyph deception technique.`);
    }

    // 5. Suspicious / High-Abuse Top-Level Domain (oddTlds check)
    const activeTld = suffix.split('.').at(-1) || '';
    if (oddTlds.includes(activeTld)) {
      add('tld_abuse', 20, `High-abuse top-level domain (.${activeTld})`, `The top-level extension .${activeTld} has elevated abuse rates in phishing datasets. While used by legitimate sites, extra scrutiny is warranted.`);
    }

    // 6. Brand paired with high-abuse TLD
    const isBrandApex = BRANDS.includes(rootLabel);
    if (isBrandApex && oddTlds.includes(activeTld)) {
      add('brand_tld', 20, 'Brand name with high-abuse TLD', `The brand name '${rootLabel}' is paired with a high-abuse extension (.${activeTld}) rather than an official corporate domain.`);
    }

    // 7. No HTTPS Encryption
    if (url.protocol === 'http:') {
      add('http', 10, 'No HTTPS encryption', 'Without HTTPS, entered information and page contents are not encrypted in transit.');
    }

    // 8. Known URL Shortener
    if (SHORTENERS.includes(host)) {
      add('shortener', 15, 'Known URL shortener', 'A short link redirects through an intermediary service, hiding its final destination until visited.');
    }

    // 9. Punycode / Internationalized Domain Name (IDN) Indicator
    if (host.startsWith('xn--') || host.split('.').some(l => l.startsWith('xn--'))) {
      add('punycode', 20, 'Punycode / homoglyph indicator', 'Internationalized domain names can visually imitate ASCII characters (e.g. Cyrillic "а" imitating Latin "a").');
    }

    // 10. Non-Standard Port Specification
    if (url.port && url.port !== '80' && url.port !== '443') {
      add('port', 15, `Non-standard port (:${url.port})`, `Standard web services run on port 80 (HTTP) or 443 (HTTPS). Non-standard ports can indicate temporary phishing servers or attempts to evade monitoring.`);
    }

    // 11. Suspicious Executable / Archive File Extension in Path
    const lowerPath = url.pathname.toLowerCase();
    const foundExt = SUSPICIOUS_EXTENSIONS.find(ext => lowerPath.endsWith(ext) || lowerPath.includes(ext + '/'));
    if (foundExt) {
      add('executable_path', 25, `Suspicious executable/archive in path (${foundExt})`, `The URL points directly to an executable, script, or archive file (${foundExt}) that may download malware.`);
    }

    // 12. Potential Open Redirect Parameter in Query String
    let hasOpenRedirect = false;
    for (const p of REDIRECT_PARAMS) {
      const paramVal = url.searchParams.get(p);
      if (paramVal && /^(https?:|\/\/)/i.test(paramVal)) {
        hasOpenRedirect = true;
        break;
      }
    }
    if (hasOpenRedirect) {
      add('open_redirect', 20, 'Potential open redirect parameter', 'The query parameters contain an external URL destination. Attackers abuse open redirects on trusted sites to forward victims to malicious pages.');
    }

    // 13. Excessive URL Length
    if (url.href.length > 180) {
      add('long_url', 10, 'Excessive URL length', 'Excessively long URLs (>180 characters) are often used to conceal deceptive query parameters, tracking tokens, or target destinations.');
    }

    const score = Math.min(100, signals.reduce((n, s) => n + s.weight, 0));

    return {
      url: url,
      host: host,
      rootLabel: rootLabel,
      suffix: suffix,
      registeredDomain: registeredDomain,
      subdomains: subdomains,
      signals: signals,
      score: score
    };
  }

  // Maps numerical score to human-readable risk band
  function band(score) {
    return score <= 20
      ? 'Low structural risk signals'
      : score <= 50
        ? 'Some risk signals present'
        : 'Multiple risk signals present';
  }

  // Export module API
  root.CastleUrlPhishingHeuristics = {
    analyze,
    evaluate: analyze,
    band,
    parse,
    extractDomain,
    BRANDS,
    oddTlds,
    MULTI_PART_SUFFIXES,
    SHORTENERS,
    DANGEROUS_SCHEMES,
    NON_WEB_SCHEMES
  };

})(window);

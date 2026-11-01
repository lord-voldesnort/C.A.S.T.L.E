# URL Structure Analyzer Walkthrough

## Card Conversion

The existing Utilities card was converted in place from URL Encoder to URL
Structure Analyzer. Its badge is now Intermediate, the title and description
describe local structural phishing analysis, and URL encode/decode remains as
a collapsed secondary Analyze-tab utility.

## Files

| File | Responsibility |
| --- | --- |
| `js/ui/tooltip.js` | Shared click/tap popover tooltip component |
| `js/url-phishing/heuristics.js` | Pure local parsing, signals, scoring |
| `js/url-phishing/learn.js` | Quiz state and glossary binding |
| `js/url-phishing/analyze.js` | Debounced analyzer and result cards |
| `js/url-phishing/build.js` | Fictional URL simulator |
| `js/url-phishing/ui.js` | Modal and Learn/Analyze/Build tabs |
| `index.html` | Converted card and script loading |
| `js/app.js` | Launch routing |

## Learn Tab Expansion

The renamed URL Structure Analyzer now presents: a phishing story hook; an
interactive URL anatomy example; eight visible expandable glossary cards; a
conceptual attacker walkthrough; a quiz with its first question visible by
default; a calm post-click checklist; and the closing scope-honesty note.
The Anatomy and Glossary sections use accessible native `<details>` disclosure,
and anatomy labels reuse the shared click/tap tooltip component. No changes
were made to `heuristics.js`, `analyze.js`, or `build.js` for this expansion.

## Actual Test Results

| URL | Expected | Actual | Match |
| --- | --- | --- | --- |
| `https://www.google.com` | None | None | Yes |
| `http://192.168.1.1/login` | IP, No HTTPS | IP address used as a destination; No HTTPS | Yes |
| `https://real-site.com@evil-site.com/` | @ trick | @ symbol trick | Yes |
| `https://paypal.com.verify-account.xyz` | Subdomain, brand+odd TLD | Suspicious subdomain structure; Brand name with unexpected TLD | Yes |
| `https://paypa1.com` | Lookalike | Possible paypal lookalike | Yes |
| `https://accounts.google.com` | None | None | Yes |
| `http://example.com` | No HTTPS | No HTTPS | Yes |
| `https://bit.ly/3xyzabc` | Shortener | Known URL shortener | Yes |
| `https://xn--pypal-4ve.com` | Punycode | Punycode / homoglyph indicator | Yes |
| `https://my-personal-blog-about-cooking.com` | None | None | Yes |
| `https://a.b.c.d.e.paypal-support.tk` | Subdomains, brand+odd TLD | Suspicious subdomain structure; Brand name with unexpected TLD | Yes |

Chromium also verified empty input, `hello world`, a 500+ character URL, the
Learn quiz, Analyze live scoring, Build toggles, and tooltip click/tap open and
close behavior.

## Regression Contract

The 11 URL vectors above are also documented at the top of
`js/url-phishing/heuristics.js`, next to the detection logic they govern.
`js/ui/tooltip.js` is a shared click/tap component used by this module's Learn
glossary. Any future tooltip change must re-run this module's click and touch/
tap verification as well as its own tests.

## Browser-Test Note

One initial Playwright launch was blocked before execution by the approval
service with `Automatic approval review failed: Selected model is at capacity`.
No application code or test code changed to resolve it; a later retry was
approved and completed the Chromium verification above. This is intermittent
environment capacity risk that may affect future browser-test launches across
modules, not a URL Structure Analyzer defect.

## Privacy and Scope

The detector contains no network, API, DNS, WHOIS, or reputation lookup code.
Google Safe Browsing and VirusTotal are explicit user-clicked new-tab links
only. Structural scores are not safety verdicts.

## Deviations

No live reputation result is presented because this module intentionally never
contacts external services. The tooltip is a shared click/tap popover because
the existing project had no mobile-capable tooltip component.

(function(root) {
  function review(mode, passphrase) {
    const strength = mode === 'passphrase' && root.CastlePassword && root.CastlePassword.Analysis ? root.CastlePassword.Analysis.analyzePassword(passphrase || '') : null;
    const score = mode === 'random' ? 96 : Math.max(45, Math.min(96, 55 + (strength ? strength.strength.scorePercent * .4 : 0)));
    return { score: Math.round(score), strength, recommendation: mode === 'random' ? 'Store the random key separately from the encrypted file.' : (strength && strength.strength.scoreStep < 3 ? 'Use a longer, unique passphrase and do not send it with the file.' : 'Keep the passphrase separate from the encrypted file.') };
  }
  root.CastleAESCoach = { review };
})(window);

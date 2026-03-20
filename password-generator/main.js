(function () {
  const LOWERCASE = "abcdefghjkmnpqrstuvwxyz";
  const UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const NUMBERS = "23456789";
  const SYMBOLS = "!@#$%^&*()_+=[]{}:;,.?";
  const AMBIGUOUS = new Set(["0", "O", "o", "1", "l", "I", "|"]);

  const elements = {
    passwordOutput: document.getElementById("passwordOutput"),
    generateButton: document.getElementById("generateButton"),
    copyButton: document.getElementById("copyButton"),
    passwordCount: document.getElementById("passwordCount"),
    groupCount: document.getElementById("groupCount"),
    charsPerGroup: document.getElementById("charsPerGroup"),
    separatorInput: document.getElementById("separatorInput"),
    noSeparator: document.getElementById("noSeparator"),
    includeLowercase: document.getElementById("includeLowercase"),
    includeUppercase: document.getElementById("includeUppercase"),
    includeNumbers: document.getElementById("includeNumbers"),
    includeSymbols: document.getElementById("includeSymbols"),
    excludeAmbiguous: document.getElementById("excludeAmbiguous"),
    statusMessage: document.getElementById("statusMessage"),
    lengthSummary: document.getElementById("lengthSummary"),
    charsetSummary: document.getElementById("charsetSummary"),
    entropySummary: document.getElementById("entropySummary")
  };

  function clampInteger(value, min, max, fallback) {
    const numeric = Number.parseInt(value, 10);
    if (!Number.isFinite(numeric)) return fallback;
    return Math.min(max, Math.max(min, numeric));
  }

  function getSelectedCharsets() {
    const pools = [];

    if (elements.includeLowercase.checked) pools.push(LOWERCASE);
    if (elements.includeUppercase.checked) pools.push(UPPERCASE);
    if (elements.includeNumbers.checked) pools.push(NUMBERS);
    if (elements.includeSymbols.checked) pools.push(SYMBOLS);

    if (!pools.length) return [];

    if (!elements.excludeAmbiguous.checked) return pools;

    return pools.map((pool) => Array.from(pool).filter((character) => !AMBIGUOUS.has(character)).join(""));
  }

  function getCombinedCharset() {
    return getSelectedCharsets().join("");
  }

  function secureRandomInt(maxExclusive) {
    if (maxExclusive <= 0) {
      throw new Error("maxExclusive must be greater than zero.");
    }

    const cryptoApi = globalThis.crypto;
    if (!cryptoApi || typeof cryptoApi.getRandomValues !== "function") {
      throw new Error("Secure randomness is not available in this browser.");
    }

    const values = new Uint32Array(1);
    const maxUint = 0x100000000;
    const limit = maxUint - (maxUint % maxExclusive);

    let value = 0;
    do {
      cryptoApi.getRandomValues(values);
      value = values[0];
    } while (value >= limit);

    return value % maxExclusive;
  }

  function chooseCharacter(pool) {
    return pool[secureRandomInt(pool.length)];
  }

  function shuffleCharacters(characters) {
    const clone = characters.slice();

    for (let index = clone.length - 1; index > 0; index -= 1) {
      const swapIndex = secureRandomInt(index + 1);
      const current = clone[index];
      clone[index] = clone[swapIndex];
      clone[swapIndex] = current;
    }

    return clone;
  }

  function buildPassword(config) {
    const totalLength = config.groupCount * config.charsPerGroup;
    const combinedCharset = getCombinedCharset();
    const selectedCharsets = getSelectedCharsets().filter(Boolean);

    if (!combinedCharset.length || !selectedCharsets.length) {
      throw new Error("Select at least one character set.");
    }

    const characters = [];

    for (const pool of selectedCharsets) {
      if (characters.length < totalLength) {
        characters.push(chooseCharacter(pool));
      }
    }

    while (characters.length < totalLength) {
      characters.push(chooseCharacter(combinedCharset));
    }

    const shuffled = shuffleCharacters(characters);
    const groups = [];

    for (let index = 0; index < totalLength; index += config.charsPerGroup) {
      groups.push(shuffled.slice(index, index + config.charsPerGroup).join(""));
    }

    return config.noSeparator ? groups.join("") : groups.join(config.separator);
  }

  function readConfig() {
    const passwordCount = clampInteger(elements.passwordCount.value, 1, 20, 6);
    const groupCount = clampInteger(elements.groupCount.value, 1, 12, 4);
    const charsPerGroup = clampInteger(elements.charsPerGroup.value, 1, 32, 4);

    elements.passwordCount.value = String(passwordCount);
    elements.groupCount.value = String(groupCount);
    elements.charsPerGroup.value = String(charsPerGroup);

    return {
      passwordCount,
      groupCount,
      charsPerGroup,
      separator: elements.separatorInput.value || "-",
      noSeparator: elements.noSeparator.checked
    };
  }

  function formatEntropy(bits) {
    return `${bits.toFixed(1)} bits`;
  }

  function updateSummary() {
    const config = readConfig();
    const charset = getCombinedCharset();
    const totalCharacters = config.groupCount * config.charsPerGroup;
    const totalLength = config.noSeparator
      ? totalCharacters
      : totalCharacters + ((config.groupCount - 1) * config.separator.length);

    elements.lengthSummary.textContent = String(totalLength);
    elements.charsetSummary.textContent = String(charset.length);

    if (!charset.length) {
      elements.entropySummary.textContent = "0 bits";
      return;
    }

    const entropyBits = totalCharacters * Math.log2(charset.length);
    elements.entropySummary.textContent = formatEntropy(entropyBits);
  }

  function setStatus(message) {
    elements.statusMessage.textContent = message;
  }

  function generatePasswords() {
    const config = readConfig();

    try {
      const passwords = [];
      for (let index = 0; index < config.passwordCount; index += 1) {
        passwords.push(buildPassword(config));
      }

      elements.passwordOutput.value = passwords.join("\n");
      const separatorLabel = config.noSeparator ? "no separators" : `separator "${config.separator}"`;
      setStatus(`Generated ${config.passwordCount} password${config.passwordCount === 1 ? "" : "s"} with ${separatorLabel}.`);
    } catch (error) {
      elements.passwordOutput.value = "";
      setStatus(error.message);
    }

    updateSummary();
  }

  async function copyOutput() {
    const value = elements.passwordOutput.value.trim();

    if (!value) {
      setStatus("Nothing to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setStatus("Copied to clipboard.");
    } catch {
      elements.passwordOutput.select();
      document.execCommand("copy");
      setStatus("Copied to clipboard.");
    }
  }

  function handleSeparatorToggle() {
    elements.separatorInput.disabled = elements.noSeparator.checked;
    elements.separatorInput.setAttribute("aria-disabled", String(elements.noSeparator.checked));
    updateSummary();
  }

  const watchedInputs = [
    elements.passwordCount,
    elements.groupCount,
    elements.charsPerGroup,
    elements.separatorInput,
    elements.noSeparator,
    elements.includeLowercase,
    elements.includeUppercase,
    elements.includeNumbers,
    elements.includeSymbols,
    elements.excludeAmbiguous
  ];

  for (const input of watchedInputs) {
    input.addEventListener("input", updateSummary);
    input.addEventListener("change", () => {
      if (input === elements.noSeparator) {
        handleSeparatorToggle();
      } else {
        updateSummary();
      }
    });
  }

  elements.generateButton.addEventListener("click", generatePasswords);
  elements.copyButton.addEventListener("click", copyOutput);

  handleSeparatorToggle();
  generatePasswords();
})();

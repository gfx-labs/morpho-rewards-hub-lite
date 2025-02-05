const keccak = require("keccak");

module.exports = {
  meta: {
    type: "problem",
    fixable: "code",
    docs: {
      description:
        "Enforce ethereum addresses to be checksum to prevent string comparison errors",
    },
  },
  create: function (context) {
    return {
      Literal: function (node) {
        if (!isAddress(node.value)) return;
        const checksumAddress = toChecksumAddress(node.value);
        if (node.value !== checksumAddress) {
          context.report({
            node: node,
            message: "Ethereum addresses should be checksum",
            fix: function (fixer) {
              return fixer.replaceText(node, `"${checksumAddress}"`);
            },
          });
        }
      },
    };
  },
};

const isAddress = (address) =>
  typeof address === "string" && /^(0x)?[0-9a-f]{40}$/i.test(address);
const toChecksumAddress = (address, chainId = null) => {
  if (!isAddress(address)) {
    throw new Error(
      `Given address "${address}" is not a valid Ethereum address.`
    );
  }

  const stripAddress = stripHexPrefix(address).toLowerCase();
  const prefix = chainId != null ? chainId.toString() + "0x" : "";
  const keccakHash = keccak("keccak256")
    .update(prefix + stripAddress)
    .digest("hex");
  let checksumAddress = "0x";

  for (let i = 0; i < stripAddress.length; i++) {
    checksumAddress +=
      parseInt(keccakHash[i], 16) >= 8
        ? stripAddress[i].toUpperCase()
        : stripAddress[i];
  }

  return checksumAddress;
};

const stripHexPrefix = (value) =>
  value.slice(0, 2) === "0x" ? value.slice(2) : value;

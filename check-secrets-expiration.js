const { SecretClient } = require("@azure/keyvault-secrets");
const { DefaultAzureCredential } = require("@azure/identity");

const EXPIRATION_DEADLINE = parseInt(process.env.EXPIRATION_DEADLINE);
const VAULT_NAME = process.env.VAULT_NAME;

const KVUri = `https://${VAULT_NAME}.vault.azure.net`;

const credential = new DefaultAzureCredential();
const client = new SecretClient(KVUri, credential);

const today = new Date();
const expired = [];
const expiring = [];

async function fetchSecretProperties() {
  const secretProperties = await client.listPropertiesOfSecrets();

  secretProperties.forEach((prop) => {
    if (prop.expiresOn) {
      const delta = new Date(prop.expiresOn) - today;
      const daysDifference = Math.floor(delta / (24 * 60 * 60 * 1000));

      if (daysDifference <= 0) {
        expired.push(`${prop.name}: ${daysDifference} days`);
      } else if (daysDifference < EXPIRATION_DEADLINE) {
        expiring.push(`${prop.name}: ${daysDifference} days`);
      }
    }
  });

  console.log(`Expired Secrets in vault ${VAULT_NAME}\n`);
  console.log(expired.join("\n"));

  console.log(`Expiring Secrets in vault ${VAULT_NAME} < ${EXPIRATION_DEADLINE}\n`);
  console.log(expiring.join("\n"));
}

fetchSecretProperties().catch(console.error);

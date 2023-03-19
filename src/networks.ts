if (!process.env.PROVIDER_URL) {
  throw new Error('PROVIDER_URL is not set');
}

export default {
  "11155111": {
    provider: process.env.PROVIDER_URL,
  }
}
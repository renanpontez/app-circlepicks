/**
 * Configuração de variáveis de ambiente
 */

interface Environment {
  API_URL: string;
  ENV: 'development' | 'staging' | 'production';
  DEBUG: boolean;
}

const getEnvironment = (): Environment => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

  // DEBUG: log API URL on startup to verify .env is embedded correctly
  console.log('[ENV] API_URL:', apiUrl);
  console.log('[ENV] SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL?.substring(0, 30));

  return {
    API_URL: apiUrl,
    ENV: __DEV__ ? 'development' : 'production',
    DEBUG: __DEV__,
  };
};

export const env = getEnvironment();

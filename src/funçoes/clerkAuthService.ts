import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import * as SecureStore from 'expo-secure-store';
import { Router } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

export interface AuthResult {
  success: boolean;
  error?: string;
  sessionId?: string;
}

interface SignIn {
  create: (params: any) => Promise<any>;
  reload: () => Promise<void>;
  status: string;
  createdSessionId?: string;
  attemptFirstFactor?: (params: any) => Promise<any>;
}

export class ClerkAuthService {
  // Constantes para chaves de armazenamento
  private static readonly TOKEN_KEY = "clerk_session_token";
  private static readonly SESSION_KEY = "clerk_session_id";

  // Método para limpar tokens de forma segura
  private static async clearStoredTokens(): Promise<void> {
    try {
      // Verificar e remover token de sessão
      const tokenExists = await SecureStore.getItemAsync(this.TOKEN_KEY);
      if (tokenExists) {
        await SecureStore.deleteItemAsync(this.TOKEN_KEY);
      }

      // Verificar e remover ID de sessão
      const sessionExists = await SecureStore.getItemAsync(this.SESSION_KEY);
      if (sessionExists) {
        await SecureStore.deleteItemAsync(this.SESSION_KEY);
      }

      console.log("[AuthService] Tokens limpos com sucesso");
    } catch (err) {
      console.error("[AuthService] Erro ao limpar tokens:", err);
    }
  }

  // Verificar conectividade de rede
  private static async checkConnectivity(): Promise<boolean> {
    try {
      const netInfo = await NetInfo.fetch();
      return netInfo.isConnected === true;
    } catch (error) {
      console.error("[AuthService] Erro na verificação de conectividade:", error);
      return false;
    }
  }

  // Método principal de login com Google
  public static async signInWithGoogle(
    signIn: SignIn | null, 
    router: Router
  ): Promise<AuthResult> {
    // Verificações iniciais
    if (!signIn) {
      return {
        success: false,
        error: "Serviço de login não disponível"
      };
    }

    // Limpar tokens antigos
    await this.clearStoredTokens();

    // Verificar conectividade
    const isConnected = await this.checkConnectivity();
    if (!isConnected) {
      return {
        success: false,
        error: "Sem conexão com a internet"
      };
    }

    try {
      console.log("[AuthService] Iniciando login com Google");
      
      // Configurar URL de redirecionamento
      const redirectUrl = makeRedirectUri({
        scheme: 'exp',
        path: 'oauth-native-callback'
      });
      
      // Criar sessão de login
      let signInAttempt;
      try {
        signInAttempt = await signIn.create({
          strategy: "oauth_google",
          redirectUrl: redirectUrl
        });
      } catch (createError) {
        console.error("[AuthService] Erro ao criar login:", createError);
        return {
          success: false,
          error: `Erro ao iniciar autenticação: ${String(createError)}`
        };
      }

      // Verificar status da sessão
      if (signInAttempt.status === "complete") {
        return {
          success: true,
          sessionId: signInAttempt.createdSessionId
        };
      }

      // Processar URL de autenticação
      if (signInAttempt.status === "needs_identifier") {
        const authUrl = 
          signInAttempt.firstFactorVerification?.externalVerificationRedirectURL || 
          signInAttempt.verificationURLs?.external;

        if (!authUrl) {
          return {
            success: false,
            error: "URL de autenticação não disponível"
          };
        }

        // Tratamento específico por plataforma
        try {
          const result = await WebBrowser.openAuthSessionAsync(
            authUrl.toString(),
            redirectUrl,
            Platform.OS === 'ios' 
              ? { 
                  showInRecents: true, 
                  preferEphemeralSession: false 
                } 
              : {}
          );

          // Aguardar processamento
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Recarregar estado do login
          await signIn.reload();

          // Verificar resultado
          if (signIn.status === "complete") {
            // Armazenar tokens de forma segura
            if (signIn.createdSessionId) {
              await SecureStore.setItemAsync(
                this.SESSION_KEY, 
                signIn.createdSessionId
              );
            }

            return {
              success: true,
              sessionId: signIn.createdSessionId
            };
          }

          // Tratar casos de sucesso no navegador
          if (result.type === "success") {
            return {
              success: true,
              sessionId: "sessao_pendente"
            };
          }

          return {
            success: false,
            error: `Autenticação incompleta: ${result.type}`
          };
        } catch (browserError) {
          console.error("[AuthService] Erro no navegador:", browserError);
          return {
            success: false,
            error: `Erro de autenticação: ${String(browserError)}`
          };
        }
      }
      
      return {
        success: false,
        error: `Status inesperado: ${signInAttempt.status}`
      };
    } catch (error) {
      console.error("[AuthService] Erro geral:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido"
      };
    }
  }
}

export default ClerkAuthService;
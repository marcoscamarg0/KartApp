import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Router } from 'expo-router';

// Certifique-se que esta linha está no início do arquivo
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
  // Função para limpar tokens armazenados
  private static async clearStoredTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync("clerk-js-sdk:token");
      await SecureStore.deleteItemAsync("clerk-js-sdk:session");
      console.log("[AuthService] Tokens limpos com sucesso");
    } catch (err) {
      console.error("[AuthService] Erro ao limpar tokens:", err);
    }
  }

  private static async checkConnectivity(): Promise<boolean> {
    try {
      const netInfo = await NetInfo.fetch();
      return netInfo.isConnected === true;
    } catch (error) {
      console.error("[AuthService] Connectivity check error:", error);
      return false;
    }
  }

  public static async signInWithGoogle(
    signIn: SignIn | null, 
    router: Router
  ): Promise<AuthResult> {
    if (!signIn) {
      return {
        success: false,
        error: "SignIn is not available"
      };
    }

    // Limpar tokens anteriores para evitar problemas
    await this.clearStoredTokens();

    // Verificação de conectividade
    const isConnected = await this.checkConnectivity();
    if (!isConnected) {
      return {
        success: false,
        error: "Sem conexão com a internet"
      };
    }

    try {
      console.log("[AuthService] Iniciando processo de login com Google");
      
      // Criar URL de redirecionamento
      const redirectUrl = makeRedirectUri({
        scheme: 'exp',
        path: 'oauth-native-callback'
      });
      
      console.log("[AuthService] URL de redirecionamento:", redirectUrl);

      // Criar a sessão de login
      let signInAttempt;
      try {
        signInAttempt = await signIn.create({
          strategy: "oauth_google",
          redirectUrl: redirectUrl
        });
        
        console.log("[AuthService] SignIn criado, status:", signInAttempt.status);
      } catch (createError) {
        console.error("[AuthService] Erro ao criar signIn:", createError);
        return {
          success: false,
          error: `Erro ao iniciar autenticação: ${String(createError)}`
        };
      }

      // Se já estiver completo, retornar sucesso
      if (signInAttempt.status === "complete") {
        return {
          success: true,
          sessionId: signInAttempt.createdSessionId
        };
      }

      // Verificar se temos a URL de autenticação
      if (signInAttempt.status === "needs_identifier") {
        const authUrl = 
          signInAttempt.firstFactorVerification?.externalVerificationRedirectURL || 
          signInAttempt.verificationURLs?.external;

        if (!authUrl) {
          console.error("[AuthService] URL de autenticação não disponível");
          return {
            success: false,
            error: "URL de autenticação não disponível"
          };
        }

        console.log("[AuthService] Abrindo URL de autenticação:", authUrl.toString());
        
        // Implementação específica por plataforma
        if (Platform.OS === 'ios') {
          try {
            // Para iOS, usar openAuthSessionAsync com opções específicas
            const result = await WebBrowser.openAuthSessionAsync(
              authUrl.toString(),
              redirectUrl,
              {
                showInRecents: true,
                preferEphemeralSession: false
              }
            );
            
            console.log("[AuthService] Resultado do navegador iOS:", JSON.stringify(result));
            
            // Esperar um pouco para dar tempo ao Clerk de processar
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Recarregar o estado do signIn
            await signIn.reload();
            console.log("[AuthService] Status após reload:", signIn.status);
            
            // Verificar se o login foi bem-sucedido
            if (signIn.status === "complete") {
              return {
                success: true,
                sessionId: signIn.createdSessionId
              };
            }
            
            // Mesmo se o status não for "complete", considerar sucesso se o browser retornou success
            if (result.type === "success") {
              return {
                success: true,
                sessionId: "pending-session"
              };
            }
            
            return {
              success: false,
              error: `Autenticação incompleta: ${result.type}`
            };
          } catch (browserError) {
            console.error("[AuthService] Erro ao abrir navegador iOS:", browserError);
            return {
              success: false,
              error: `Erro ao abrir navegador: ${String(browserError)}`
            };
          }
        } else {
          // Para Android
          try {
            const result = await WebBrowser.openAuthSessionAsync(
              authUrl.toString(),
              redirectUrl
            );
            
            console.log("[AuthService] Resultado do navegador Android:", JSON.stringify(result));
            
            // Esperar um pouco para dar tempo ao Clerk de processar
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Recarregar o estado do signIn
            await signIn.reload();
            console.log("[AuthService] Status após reload:", signIn.status);
            
            // Verificar se o login foi bem-sucedido
            if (signIn.status === "complete") {
              return {
                success: true,
                sessionId: signIn.createdSessionId
              };
            }
            
            // Mesmo se o status não for "complete", considerar sucesso se o browser retornou success
            if (result.type === "success") {
              return {
                success: true,
                sessionId: "pending-session"
              };
            }
            
            return {
              success: false,
              error: `Autenticação incompleta: ${result.type}`
            };
          } catch (browserError) {
            console.error("[AuthService] Erro ao abrir navegador Android:", browserError);
            return {
              success: false,
              error: `Erro ao abrir navegador: ${String(browserError)}`
            };
          }
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
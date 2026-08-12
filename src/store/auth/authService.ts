import axios from 'axios';
import { apiService } from '@/services/APIService';
import { EVO_AUTH_URL } from '@/services/evoConfig';
import type { User } from '@/types/User';
import type {
  LoginPayload,
  LoginResponse,
  LoginApiResponse,
  MfaRequiredResponse,
  MfaVerificationPayload,
  ResetPasswordPayload,
  ResetPasswordResponse,
  AvailabilityPayload,
  ProfileResponse,
  SetActiveAccountPayload,
  SsoAuthPayload,
  SsoAuthResponse,
} from './authTypes';

export class AuthService {
  static async login(credentials: LoginPayload): Promise<LoginResponse | MfaRequiredResponse> {
    // EvoCRM: real login lives on evo-auth-service, not this app's default
    // Chatwoot `auth/sign_in` (Devise Token Auth) endpoint. See phase0 findings doc.
    const response = await axios.post(`${EVO_AUTH_URL}/api/v1/auth/login`, credentials);
    const { user, accounts, token } = response.data.data;

    return {
      user: {
        ...user,
        account_id: accounts[0]?.id,
        accounts,
        avatar_url: user.avatar_url ?? '',
        identifier_hash: user.identifier_hash ?? '',
        availability_status: user.availability,
        thumbnail: user.thumbnail ?? '',
      } as User,
      headers: null,
      accessToken: token.access_token,
    } as LoginResponse;
  }

  static async verifyMfa(payload: MfaVerificationPayload): Promise<LoginResponse> {
    const response = await apiService.post<{ data: User }>('auth/sign_in', payload);
    return {
      user: response.data.data,
      headers: {
        'access-token': response.headers['access-token'],
        uid: response.headers.uid,
        client: response.headers.client,
      },
    };
  }
  static async getProfile(): Promise<ProfileResponse> {
    const response = await apiService.get<ProfileResponse>('profile');
    return response.data;
  }
  static async resetPassword(payload: ResetPasswordPayload): Promise<ResetPasswordResponse> {
    const response = await apiService.post<ResetPasswordResponse>('auth/password', payload);
    return response.data;
  }
  static async updateAvailability(payload: AvailabilityPayload): Promise<ProfileResponse> {
    const response = await apiService.post<ProfileResponse>('profile/availability', payload);
    return response.data;
  }

  static async setActiveAccount(payload: SetActiveAccountPayload): Promise<ProfileResponse> {
    const response = await apiService.put<ProfileResponse>('profile/set_active_account', payload);
    return response.data;
  }

  static async loginWithSso(payload: SsoAuthPayload): Promise<SsoAuthResponse> {
    const response = await apiService.post<{ data: User }>('auth/sign_in', payload);
    return {
      user: response.data.data,
      headers: {
        'access-token': response.headers['access-token'],
        uid: response.headers.uid,
        client: response.headers.client,
      },
    };
  }
}

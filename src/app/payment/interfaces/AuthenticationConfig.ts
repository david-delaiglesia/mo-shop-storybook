export enum AuthenticationMode {
  REDIRECTION = 'redirection',
  REST = 'rest',
}

export enum AuthenticationExemption {
  MIT = 'MIT',
}

export type AuthenticationConfigResponse =
  | {
      authentication_mode: AuthenticationMode.REDIRECTION
      authentication_uuid: string
      exemption: AuthenticationExemption | null
    }
  | {
      authentication_mode: AuthenticationMode.REST
    }

export type AuthenticationConfig =
  | {
      authenticationMode: AuthenticationMode.REDIRECTION
      authenticationUuid: string
      exemption: AuthenticationExemption | null
    }
  | {
      authenticationMode: AuthenticationMode.REST
    }

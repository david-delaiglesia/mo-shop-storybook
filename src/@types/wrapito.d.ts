import 'wrapito'
import { RequestOptions } from 'wrapito'

import { CartResponse } from 'app/cart'
import { UserResponse } from 'app/user'

declare module 'wrapito' {
  interface Wrap {
    withLogin: (overrides?: {
      cart?: CartResponse
      user?: Partial<UserResponse>
    }) => Wrap
  }
}

interface WrapitoMatchers {
  toHaveBeenFetched: () => void
  toHaveBeenFetchedWith: (options: RequestOptions) => void
  toHaveBeenFetchedTimes: (times: number) => void
}

declare global {
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars
    interface Matchers<R> extends WrapitoMatchers {}
  }
}

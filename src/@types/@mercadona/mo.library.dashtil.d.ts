declare module '@mercadona/mo.library.dashtil' {
  export function camelCaseToSnakeCase<ReturnType>(
    camelCaseObject: unknown,
  ): ReturnType

  export function snakeCaseToCamelCase<ReturnType>(
    snakeCaseObject: unknown,
  ): ReturnType

  export function useClickOut<ElementType extends HTMLElement>(
    onClickOutside: () => void,
    isRefVisible: boolean,
  ): { refContainer: React.RefObject<ElementType> }

  export function useEscape(callbackFn: () => void): void

  export function compose<ArgsType, ResultType extends ArgsType>(
    fn1: (arg: ArgsType) => ResultType,
    ...fns: Array<(arg: ArgsType) => ArgsType>
  ): (arg: ArgsType) => ResultType

  export function createThunk<ArgsType, ResultType>(
    fn: (arg: ArgsType) => ResultType,
  ): (arg: ArgsType) => ResultType

  type ActionHandlers<State> = Record<string, (state: State, payload) => State>

  export function createReducer<State>(
    initialState: State,
    actionHandlers: ActionHandlers<State>,
  ): (state?: State, action: AnyAction) => State
}

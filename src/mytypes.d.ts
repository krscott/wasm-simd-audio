declare type Fc<P extends Record<string, unknown>> = (props: P) => JSX.Element;

declare type ParentFc<P extends Record<string, unknown>> = (
  props: { children?: preact.ComponentChildren } & P
) => JSX.Element;

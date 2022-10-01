declare type Fc<P extends {}> = (props: P) => JSX.Element;

declare type ParentFc<P extends {}> = (
  props: { children?: preact.ComponentChildren } & P
) => JSX.Element;

import type { ReactNode } from "react";

type ProviderValue<T> = [Context<T>, T];
type ProviderValues<A, B, C, D, E, F, G, H, I, J, K> =
  | [ProviderValue<A>]
  | [ProviderValue<A>, ProviderValue<B>]
  | [ProviderValue<A>, ProviderValue<B>, ProviderValue<C>]
  | [ProviderValue<A>, ProviderValue<B>, ProviderValue<C>, ProviderValue<D>]
  | [
      ProviderValue<A>,
      ProviderValue<B>,
      ProviderValue<C>,
      ProviderValue<D>,
      ProviderValue<E>,
    ]
  | [
      ProviderValue<A>,
      ProviderValue<B>,
      ProviderValue<C>,
      ProviderValue<D>,
      ProviderValue<E>,
      ProviderValue<F>,
    ]
  | [
      ProviderValue<A>,
      ProviderValue<B>,
      ProviderValue<C>,
      ProviderValue<D>,
      ProviderValue<E>,
      ProviderValue<F>,
      ProviderValue<G>,
    ]
  | [
      ProviderValue<A>,
      ProviderValue<B>,
      ProviderValue<C>,
      ProviderValue<D>,
      ProviderValue<E>,
      ProviderValue<F>,
      ProviderValue<G>,
      ProviderValue<H>,
    ]
  | [
      ProviderValue<A>,
      ProviderValue<B>,
      ProviderValue<C>,
      ProviderValue<D>,
      ProviderValue<E>,
      ProviderValue<F>,
      ProviderValue<G>,
      ProviderValue<H>,
      ProviderValue<I>,
    ]
  | [
      ProviderValue<A>,
      ProviderValue<B>,
      ProviderValue<C>,
      ProviderValue<D>,
      ProviderValue<E>,
      ProviderValue<F>,
      ProviderValue<G>,
      ProviderValue<H>,
      ProviderValue<I>,
      ProviderValue<J>,
    ]
  | [
      ProviderValue<A>,
      ProviderValue<B>,
      ProviderValue<C>,
      ProviderValue<D>,
      ProviderValue<E>,
      ProviderValue<F>,
      ProviderValue<G>,
      ProviderValue<H>,
      ProviderValue<I>,
      ProviderValue<J>,
      ProviderValue<K>,
    ];

type ProviderProps<A, B, C, D, E, F, G, H, I, J, K> = {
  values: ProviderValues<A, B, C, D, E, F, G, H, I, J, K>;
  children: ReactNode;
};

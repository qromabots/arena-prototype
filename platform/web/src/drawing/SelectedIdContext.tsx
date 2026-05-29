import { createContext, useContext, type Dispatch, type SetStateAction } from 'react';

export type SelectedIdState = [
  string | null,
  Dispatch<SetStateAction<string | null>>,
];

export const SelectedIdContext = createContext<SelectedIdState>([
  null,
  () => {},
]);

export const useSelectedIdState = () => useContext(SelectedIdContext);

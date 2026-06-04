import { createContext, useContext, useRef, type ReactNode, type RefObject } from 'react';

export type LocalRobotPose = {
  x: number;
  y: number;
  angle: number;
};

const LocalRobotRefContext = createContext<RefObject<LocalRobotPose | null> | null>(
  null,
);

export function LocalRobotRefProvider({ children }: { children: ReactNode }) {
  const poseRef = useRef<LocalRobotPose | null>(null);
  return (
    <LocalRobotRefContext.Provider value={poseRef}>
      {children}
    </LocalRobotRefContext.Provider>
  );
}

export function useLocalRobotRef(): RefObject<LocalRobotPose | null> {
  const ref = useContext(LocalRobotRefContext);
  if (!ref) {
    throw new Error('useLocalRobotRef must be used within LocalRobotRefProvider');
  }
  return ref;
}

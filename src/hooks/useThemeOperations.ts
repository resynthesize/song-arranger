/**
 * Cyclone - useThemeOperations Hook
 * Extracted theme operations logic from FileMenu
 */

import { useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setTheme, type Theme } from '@/store/slices/themeSlice';

export interface UseThemeOperationsReturn {
  handleSetThemeModern: () => void;
  handleSetThemeRetro: () => void;
  handleSetThemeMinimalist: () => void;
  handleSetTheme: (theme: Theme) => void;
}

export function useThemeOperations(): UseThemeOperationsReturn {
  const dispatch = useAppDispatch();

  const handleSetTheme = useCallback((theme: Theme) => {
    dispatch(setTheme(theme));
  }, [dispatch]);

  const handleSetThemeModern = useCallback(() => {
    dispatch(setTheme('modern'));
  }, [dispatch]);

  const handleSetThemeRetro = useCallback(() => {
    dispatch(setTheme('retro'));
  }, [dispatch]);

  const handleSetThemeMinimalist = useCallback(() => {
    dispatch(setTheme('minimalist'));
  }, [dispatch]);

  return {
    handleSetThemeModern,
    handleSetThemeRetro,
    handleSetThemeMinimalist,
    handleSetTheme,
  };
}

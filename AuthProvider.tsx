import * as SecureStore from "expo-secure-store";
import { createContext } from "react";
import * as React from "react";

const Context = createContext<{
  value: any;
  isLoaded: boolean;
  setAsync: (value: any) => void;
}>({ value: null, isLoaded: false, setAsync() {} });

// import AsyncStorage from '@react-native-community/async-storage';
const storageKey = "DropBoxAuth";
const shouldRehydrate = true;

const defaultState = { isDark: false };

async function cacheAsync(value: any) {
  if (localStorage) {
    localStorage.setItem(storageKey, JSON.stringify(value));
  } else {
    await SecureStore.setItemAsync(storageKey, JSON.stringify(value));
  }
}

async function rehydrateAsync() {
  if (!shouldRehydrate || !SecureStore) {
    return defaultState;
  }
  try {
    let item = null;
    if (localStorage) {
      item = await localStorage.getItem(storageKey);
    } else {
      item = await SecureStore.getItemAsync(storageKey);
    }
    const data = JSON.parse(item as any);
    return data;
  } catch (ignored) {
    return defaultState;
  }
}

export default function Provider({ children }: any) {
  const [internalValue, setInternalValue] = React.useState(null);
  // const [isDark, setIsDark] = React.useState(false);
  const [isLoaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const { value } = await rehydrateAsync();
        setInternalValue(value);
      } catch (ignored) {}
      setLoaded(true);
    })();
  }, []);

  return (
    <Context.Provider
      value={{
        value: internalValue,
        isLoaded,
        setAsync: (value: any) => {
          setInternalValue(value);
          cacheAsync({ value });
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}

Provider.Context = Context;

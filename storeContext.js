import React from 'react'

export const StoreContext = React.createContext({});
export const StoreProvider = StoreContext.Provider;
export const useStore = () => React.useContext(StoreContext);

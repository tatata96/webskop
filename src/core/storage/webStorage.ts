const {localStorage, sessionStorage} = window;

export type GetItemResponse = Record<string, string | undefined>;

const webStorage = {
  local: {
    setItem(itemName: string, itemValue: WebStorageStoredValue) {
      localStorage.setItem(itemName, JSON.stringify(itemValue));
    },
    getItem<T = GetItemResponse>(itemName: string) {
      let storedValue = localStorage.getItem(itemName);

      storedValue = storedValue ? JSON.parse(storedValue) : null;

      return storedValue as unknown as T | null;
    },
    removeItem(itemName: string) {
      localStorage.removeItem(itemName);
    }
  },
  session: {
    setItem(itemName: string, itemValue: WebStorageStoredValue) {
      sessionStorage.setItem(itemName, JSON.stringify(itemValue));
    },
    getItem<T = GetItemResponse>(itemName: string) {
      let storedValue = sessionStorage.getItem(itemName);

      storedValue = storedValue ? JSON.parse(storedValue) : null;

      return storedValue as unknown as T | null;
    },
    removeItem(itemName: string) {
      sessionStorage.removeItem(itemName);
    }
  },
  cookie: {
    getCookie<T = GetItemResponse>(name: string) {
      const cookies = Object.fromEntries(
        document.cookie
          .split("; ")
          .map((cookie) => cookie.split("=").map(decodeURIComponent))
      );

      return (cookies[name] || null) as unknown as T | null;
    },
    deleteCookie(name: string) {
      document.cookie = `${name}=; Max-Age=-99999999;`;
    }
  },
  getFromWebStorage<T = GetItemResponse>(itemName: string): WebStorageStoredValue {
    let itemValue = webStorage.local.getItem(itemName);

    if (!itemValue) {
      itemValue = webStorage.session.getItem(itemName);
    }

    return itemValue as unknown as T | null;
  },
  removeFromWebStorage(itemName: string) {
    webStorage.session.removeItem(itemName);
    webStorage.local.removeItem(itemName);
  }
};

export default webStorage;

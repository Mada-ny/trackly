# StorageManager API for Persistent Local Data

The Web StorageManager API provides a way for web applications to manage their persistent storage, including checking available quota and requesting persistent storage. This is crucial for local-first applications relying on IndexedDB (and thus Dexie.js) to ensure data is not arbitrarily cleared by the browser.

## 1. Introduction to StorageManager API

The `navigator.storage` interface of the StorageManager API allows web content to access and manage persistent storage. It provides methods to:
*   Estimate available storage quota and usage.
*   Request that a site's storage be made persistent.

## 2. Checking Storage Availability and Usage (`navigator.storage.estimate()`)

This method returns an estimate of how much storage the origin has available and how much it is currently using. It's useful for informing users about storage limits or for determining if there's enough space for large data operations.

```javascript
async function checkStorageUsage() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
        const { usage, quota } = await navigator.storage.estimate();
        console.log(`Using ${usage} bytes out of ${quota} bytes available.`);
        console.log(`Percentage used: ${(usage / quota * 100).toFixed(2)}%`);
        return { usage, quota };
    } else {
        console.warn('StorageManager API not fully supported in this browser.');
        return null;
    }
}

// Call to check storage
checkStorageUsage();
```

## 3. Requesting Persistent Storage (`navigator.storage.persist()`)

By default, browser storage (including IndexedDB) is considered "best-effort" storage. This means the browser can clear it under memory pressure or after extended periods of disuse, especially for origins that don't request persistence. Requesting persistent storage significantly reduces the likelihood of data being evicted.

```javascript
async function requestPersistentStorage() {
    if ('storage' in navigator && 'persist' in navigator.storage) {
        const isPersistent = await navigator.storage.persisted();
        if (isPersistent) {
            console.log('Storage is already persistent.');
            return true;
        }

        const granted = await navigator.storage.persist();
        if (granted) {
            console.log('Persistent storage was granted.');
            return true;
        } else {
            console.log('Persistent storage was denied.');
            return false;
        }
    } else {
        console.warn('StorageManager API not fully supported in this browser.');
        return false;
    }
}

// Call to request persistent storage
requestPersistentStorage();
```
*   **User Prompt**: Requesting persistence may trigger a browser prompt asking the user for permission, especially on desktop. On some mobile platforms, it might be automatically granted based on usage patterns (e.g., app installed to homescreen).
*   **Idempotent**: Calling `persist()` multiple times won't re-prompt the user if permission has already been granted or denied.

## 4. Importance for IndexedDB/Dexie.js in Local-First Apps

For applications that store critical user data locally (e.g., offline-first PWAs, budget managers, note-taking apps), ensuring persistence is vital. Without it, users could lose their data if the browser decides to clear it. Integrating `requestPersistentStorage()` early in your application's lifecycle (e.g., after initial data sync or on first run) is a strong recommendation.

## 5. Browser Compatibility

The StorageManager API is widely supported across modern browsers. However, behavior regarding user prompts and automatic grants can vary. Always test across your target browsers.

**Check**: [Can I use Storage Standard](https://caniuse.com/mdn-api_storagemanager) for up-to-date compatibility information.

By leveraging the StorageManager API, you can provide a more reliable and robust local-first experience for your users.

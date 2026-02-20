import OneSignalWeb from 'react-onesignal';
import { Capacitor } from '@capacitor/core';

// OneSignal App IDs
const ONESIGNAL_APP_ID = "ae308957-5f54-4410-aba5-5d6378adc477";
const SAFARI_WEB_ID = "web.onesignal.auto.2eb2c68e-185f-43c2-9c38-4f330d99aa4c";

let initialized = false;

/**
 * Global OneSignal initialization for both Web and Native
 */
export const initOneSignal = async (userId?: string) => {
    if (initialized) {
        if (userId) await setOneSignalUser(userId);
        return;
    }

    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
        // --- NATIVE INITIALIZATION (Capacitor/Cordova) ---
        return new Promise<void>((resolve) => {
            const OneSignalNative = (window as any).plugins?.OneSignal;

            if (!OneSignalNative) {
                console.error("OneSignal Native Plugin no encontrado. Asegúrate de que onesignal-cordova-plugin esté instalado.");
                resolve();
                return;
            }

            try {
                // Remove this line for iOS to prevent showing the prompt immediately if you want custom logic
                OneSignalNative.setAppId(ONESIGNAL_APP_ID);

                // Handling notification opening
                OneSignalNative.setNotificationOpenedHandler((jsonData: any) => {
                    console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
                });

                // Request permissions (Android 13+ and iOS)
                OneSignalNative.promptForPushNotificationsWithUserResponse((accepted: boolean) => {
                    console.log("User accepted notifications: " + accepted);
                });

                if (userId) {
                    OneSignalNative.setExternalUserId(userId);
                }

                initialized = true;
                console.log("OneSignal Native inicializado");
                resolve();
            } catch (err) {
                console.error("Error inicializando OneSignal Native:", err);
                resolve();
            }
        });
    } else {
        // --- WEB INITIALIZATION ---
        try {
            await OneSignalWeb.init({
                appId: ONESIGNAL_APP_ID,
                safari_web_id: SAFARI_WEB_ID,
                allowLocalhostAsSecureOrigin: true,
            });

            initialized = true;

            if (userId) {
                await OneSignalWeb.login(userId);
            }

            console.log("OneSignal Web inicializado");
        } catch (error: any) {
            const errorMessage = error?.message || (typeof error === 'string' ? error : '') || '';
            if (errorMessage.includes('already initialized')) {
                initialized = true;
                if (userId) await OneSignalWeb.login(userId);
            } else {
                console.error("Error al inicializar OneSignal Web:", error);
            }
        }
    }
};

/**
 * Set the common User ID for tracking / personalized notifications
 */
export const setOneSignalUser = async (userId: string) => {
    if (!initialized) return;

    try {
        if (Capacitor.isNativePlatform()) {
            const OneSignalNative = (window as any).plugins?.OneSignal;
            if (OneSignalNative) {
                OneSignalNative.setExternalUserId(userId);
            }
        } else {
            if (OneSignalWeb.login) {
                await OneSignalWeb.login(userId);
            }
        }
    } catch (error) {
        console.error("Error setting OneSignal user:", error);
    }
};

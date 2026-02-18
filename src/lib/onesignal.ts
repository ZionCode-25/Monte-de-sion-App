import OneSignal from 'react-onesignal';

let initialized = false;

export const initOneSignal = async (userId?: string) => {
    if (initialized) {
        if (userId) await OneSignal.login(userId);
        return;
    }

    try {
        await OneSignal.init({
            appId: "ae308957-5f54-4410-aba5-5d6378adc477",
            safari_web_id: "web.onesignal.auto.2eb2c68e-185f-43c2-9c38-4f330d99aa4c",
            allowLocalhostAsSecureOrigin: true,
            // notifyButton: { enable: true } 
        });

        initialized = true;

        if (userId) {
            await OneSignal.login(userId);
        }

        console.log("OneSignal inicializado correctamente");
    } catch (error: any) {
        // Ignorar error si ya estaba inicializado
        const errorMessage = error?.message || (typeof error === 'string' ? error : '') || '';

        if (errorMessage.includes('already initialized')) {
            initialized = true;
            if (userId) await OneSignal.login(userId);
        } else {
            console.error("Error al inicializar OneSignal:", error);
        }
    }
};

export const setOneSignalUser = async (userId: string) => {
    try {
        if (typeof OneSignal !== 'undefined' && OneSignal.login) {
            await OneSignal.login(userId);
        } else {
            console.warn("OneSignal.login no está disponible todavía");
        }
    } catch (error) {
        console.error("Error setting OneSignal user:", error);
    }
};

import OneSignal from 'react-onesignal';

export const initOneSignal = async (userId?: string) => {
    try {
        await OneSignal.init({
            appId: "ae308957-5f54-4410-aba5-5d6378adc477",
            safari_web_id: "web.onesignal.auto.2eb2c68e-185f-43c2-9c38-4f330d99aa4c",
            allowLocalhostAsSecureOrigin: true,
            // notifyButton: { enable: true } // Desactivado temporalmente para corregir error de tipos TS estricto
        });

        if (userId) {
            // Login para asociar el dispositivo al usuario de Supabase
            await OneSignal.login(userId);
        }

        console.log("OneSignal inicializado correctamente");
    } catch (error) {
        console.error("Error al inicializar OneSignal:", error);
    }
};

export const setOneSignalUser = async (userId: string) => {
    try {
        await OneSignal.login(userId);
    } catch (error) {
        console.error("Error setting OneSignal user:", error);
    }
};

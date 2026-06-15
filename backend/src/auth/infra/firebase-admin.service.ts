import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // 👈 Importamos el ConfigService
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
    // Inyectamos el servicio de configuración en el constructor
    constructor(private readonly configService: ConfigService) { }

    onModuleInit() {
        // Evitamos inicializarlo dos veces si Nest hace hot-reload
        if (admin.apps.length === 0) {

            // Reconstruimos las credenciales a partir de las variables de tu .env
            const serviceAccount: admin.ServiceAccount = {
                projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
                clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
                // El .replace es obligatorio para que Node.js no interprete los \n como texto plano
                privateKey: this.configService.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
            };

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }
    }

    // Este método validará el token que envíe el frontend
    async verifyIdToken(token: string): Promise<any | null> {
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            return decodedToken; // Contiene uid, email, name, etc.
        } catch (error) {
            console.error('Error al verificar el token de Firebase:', error);
            return null;
        }
    }
}
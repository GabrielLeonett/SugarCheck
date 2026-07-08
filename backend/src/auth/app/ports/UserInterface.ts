
export interface UserPlainInterface {
    id: string;
    username: string;
    email: string;
    roles: string[];
    sexo: string;
    fechaNacimiento: Date;
    password: string;
    createdAt: Date;
}

export interface UserInterface {
    toPlain(): {
        id: string;
        username: string;
        email: string;
        roles: string[];
        sexo: string;
        fechaNacimiento: Date;
        password: string;
        createdAt: Date;
    }
}

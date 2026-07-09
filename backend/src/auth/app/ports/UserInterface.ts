
export interface UserPlainInterface {
    id: string;
    name: string;
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
        name: string;
        username: string;
        email: string;
        roles: string[];
        sexo: string;
        fechaNacimiento: Date;
        password: string;
        createdAt: Date;
    }
}


export interface UserPlainInterface {
    id: string;
    name: string;
    email: string;
    roles: string[];
    fechaNacimiento: Date;
    password: string;
    createdAt: Date;
}

export interface UserInterface {
    toPlain(): {
        id: string;
        name: string;
        email: string;
        roles: string[];
        fechaNacimiento: Date;
        password: string;
        createdAt: Date;
    }
}

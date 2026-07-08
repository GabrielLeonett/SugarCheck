import { ErrorAbstract } from '../../../shared/error-abstract';
import { Result } from '../../../shared/result';
import { UserInterface } from './UserInterface';

export interface SaveUserInterface {
    run(data: {
        name: string;
        email: string;
        roles: string[];
        sexo: string;
        fechaNacimiento: Date;
        password: string;
    }): Promise<Result<UserInterface, ErrorAbstract>>;
}

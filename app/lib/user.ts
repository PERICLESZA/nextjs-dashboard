import db from '../lib/db'
import { login } from '@prisma/client';
import { compareSync } from 'bcrypt-ts';

export async function findUserByCredentials(
    email:string, 
    password:string
    ): Promise<login | null> {
        const user = await db.login.findFirst({
            where: {
                email: email,
            },
        });

        if (!user) {
            return null;
        }

        const passwordMatch = compareSync(password, user.senha ?? '')
        
        if(passwordMatch){
            return user;
        }

        return null;
        
}
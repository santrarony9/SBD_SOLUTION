import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        const { name, email, password, role } = data;
        const normalizedEmail = email.toLowerCase();

        const existingUser = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existingUser) {
            throw new UnauthorizedException('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await this.prisma.user.create({
            data: {
                name,
                email: normalizedEmail,
                password: hashedPassword,
                role: role || 'USER',
                mobile: null,
            }
        });

        const { password: _, ...result } = newUser;
        return result;
    }

    async findById(id: string) {
        return this.prisma.user.findUnique({ where: { id } });
    }

    async findAll() {
        try {
            console.log('[Users Debug] Fetching users...');
            const roles: any[] = ['SUPER_ADMIN', 'ADMIN', 'STAFF', 'PRICE_MANAGER'];

            const users = await this.prisma.user.findMany({
                where: {
                    role: {
                        in: roles
                    }
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    mobile: true,
                    createdAt: true,
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return users;
        } catch (error: any) {
            throw new InternalServerErrorException(`Failed to fetch users: ${error.message}`);
        }
    }

    async remove(id: string) {
        try {
            const user = await this.prisma.user.findUnique({ where: { id } });
            if (!user) {
                throw new Error('User not found');
            }

            await this.prisma.user.delete({ where: { id } });
            return { message: 'User deleted successfully' };
        } catch (error: any) {
            throw new InternalServerErrorException(`Failed to delete user: ${error.message}`);
        }
    }
}

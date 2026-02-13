import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ProfileService {
    constructor(private prisma: PrismaService) { }

    async getProfile(userId: string) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                mobile: true,
                role: true,
                addresses: true,
                createdAt: true,
            },
        });
    }

    async updateProfile(userId: string, data: { name?: string; mobile?: string }) {
        return this.prisma.user.update({
            where: { id: userId },
            data,
        });
    }

    async addAddress(userId: string, address: any) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const currentAddresses = user.addresses || [];

        return this.prisma.user.update({
            where: { id: userId },
            data: {
                addresses: [...currentAddresses, address],
            },
        });
    }

    async removeAddress(userId: string, addressIndex: number) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const currentAddresses = user.addresses || [];

        const newAddresses = currentAddresses.filter((_, index) => index !== addressIndex);

        return this.prisma.user.update({
            where: { id: userId },
            data: {
                addresses: newAddresses,
            },
        });
    }

    async changePassword(userId: string, oldPass: string, newPass: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });

        if (!user.password) {
            throw new UnauthorizedException('User does not have a password set (OTP Login).');
        }

        const isMatch = await bcrypt.compare(oldPass, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid current password');
        }

        const hashedNewPassword = await bcrypt.hash(newPass, 10);
        return this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });
    }
}

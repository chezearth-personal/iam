import crypto from 'crypto';
import { Entity, Column, Index, BeforeInsert, BeforeUpdate } from 'typeorm';
import { compare, hash } from 'bcryptjs';
import { Model } from './model.entity'

export enum RoleEnumType {
  USER = 'user',
  ADMIN = 'admin'
}

@Entity('users', {schema: 'iam'})
export class User extends Model {

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Index('email_index')
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: RoleEnumType,
    default: RoleEnumType.USER
  })
  role: RoleEnumType;

  @Column({ default: false })
  verified: boolean;

  @Index('verification_code_index')
  @Column({
    name: 'verification_code',
    type: 'text',
    nullable: true
  })
  verificationCode!: string | null;

  /** ? Hash password before saving to database */
  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password, 12);
  }

  /** ? Hash password before updating it in database */
  @BeforeUpdate()
  async updateHashPassword() {
    this.password = await hash(this.password, 12);
  }

  /** ? Validate password */
  static async comparePasswords(
    candidatePassword: string,
    hashedPassword: string
  ) {
    return await compare(candidatePassword, hashedPassword);
  }

  static createVerificationCode() {
    const verificationCode = crypto.randomBytes(32).toString('hex');
    const hashedVerificationCode = crypto
      .createHash('sha256')
      .update(verificationCode)
      .digest('hex');
    return { verificationCode, hashedVerificationCode };
  }

  toJSON(): User {
    return { ...this, password: undefined, verified: undefined };
  }
}

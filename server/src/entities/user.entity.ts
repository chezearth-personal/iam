import crypto from 'crypto';
import { Entity, Column, Index, BeforeInsert, BeforeUpdate } from 'typeorm';
import { compare, hash } from 'bcryptjs';
import { Model } from './model.entity'

export enum RoleEnumType {
  USER = 'user',
  ADMIN = 'admin'
}

@Entity('users')
export class User extends Model {

  @Column()
  firstname: string;

  @Column()
  lastname: string;

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

  // @Column({ default: false })
  // skip: boolean;

  @Index('verificationcode_index')
  @Column({
    type: 'text',
    nullable: true
  })
  verificationcode!: string | null;

  /** ? Hash password before saving to database */
  @BeforeInsert()
  async hashPassword() {
    console.log('@BeforeInsert');
    // console.log('"this" =', this);
    this.password = await hash(this.password, 12);
  }

  /** ? Hash password before updating it in database */
  @BeforeUpdate()
  async updateHashPassword() {
    console.log('@BeforeUpdate');
    // console.log('"this" =', this);
    this.password = await hash(this.password, 12);
  }

  /** ? Validate password */
  static async comparePasswords(
    candidatePassword: string,
    hashedPassword: string
  ) {
    // console.log('hashedPassword =', hashedPassword);
    return await compare(candidatePassword, hashedPassword);
  }

  static createVerificationCode() {
    const verificationcode = crypto.randomBytes(32).toString('hex');
    const hashedVerificationCode = crypto
      .createHash('sha256')
      .update(verificationcode)
      .digest('hex');
    return { verificationcode, hashedVerificationCode };
  }

  toJSON(): User {
    return { ...this, password: undefined, verified: undefined };
  }
}
